import logging

from sentry.utils import json, metrics

logger = logging.getLogger(__name__)


class UnexpectedOperation(Exception):
    pass


def basic_protocol_handler(unsupported_operations):
    # The insert message formats for Version 1 and 2 are essentially unchanged,
    # so this function builds a handler function that can deal with both.

    def get_task_kwargs_for_insert(operation, event_data, task_state=None):
        if task_state and task_state.get("skip_consume", False):
            return None  # nothing to do

        kwargs = {
            "event_id": event_data["event_id"],
            "project_id": event_data["project_id"],
            "group_id": event_data["group_id"],
            "primary_hash": event_data["primary_hash"],
        }

        for name in ("is_new", "is_regression", "is_new_group_environment"):
            kwargs[name] = task_state[name]

        return kwargs

    def handle_message(operation, *data):
        if operation == "insert":
            return get_task_kwargs_for_insert(operation, *data)
        elif operation in unsupported_operations:
            logger.debug("Skipping unsupported operation: %s", operation)
            return None
        else:
            raise UnexpectedOperation(f"Received unexpected operation type: {operation!r}")

    return handle_message


version_handlers = {
    1: basic_protocol_handler(
        unsupported_operations=frozenset(["delete", "delete_groups", "merge", "unmerge"])
    ),
    2: basic_protocol_handler(
        unsupported_operations=frozenset(
            [
                "start_delete_groups",
                "end_delete_groups",
                "start_merge",
                "end_merge",
                "start_unmerge",
                "end_unmerge",
                "start_delete_tag",
                "end_delete_tag",
                "exclude_groups",
                "tombstone_events",
                "replace_group",
            ]
        )
    ),
}


class InvalidPayload(Exception):
    pass


class InvalidVersion(Exception):
    pass


def get_task_kwargs_for_message(value):
    """
    Decodes a message body, returning a dictionary of keyword arguments that
    can be applied to a post-processing task, or ``None`` if no task should be
    dispatched.
    """

    metrics.timing("eventstream.events.size.data", len(value))
    payload = json.loads(value, use_rapid_json=True)

    try:
        version = payload[0]
    except Exception:
        raise InvalidPayload("Received event payload with unexpected structure")

    try:
        handler = version_handlers[int(version)]
    except (ValueError, KeyError):
        raise InvalidVersion(
            f"Received event payload with unexpected version identifier: {version}"
        )

    return handler(*payload[1:])
