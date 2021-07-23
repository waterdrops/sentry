import {Component} from 'react';
import styled from '@emotion/styled';

import {SectionHeading} from 'app/components/charts/styles';
import {TraceContextType} from 'app/components/events/interfaces/spans/types';
import {t} from 'app/locale';
import space from 'app/styles/space';
import {Event, EventTransaction} from 'app/types/event';

type Props = {
  event: Event;
};

class RootSpanStatus extends Component<Props> {
  getTransactionEvent(): EventTransaction | undefined {
    const {event} = this.props;

    if (event.type === 'transaction') {
      return event as EventTransaction;
    }

    return undefined;
  }

  getRootSpanStatus(): string {
    const event = this.getTransactionEvent();

    const DEFAULT = '\u2014';

    if (!event) {
      return DEFAULT;
    }

    const traceContext: TraceContextType | undefined = event?.contexts?.trace;

    return traceContext?.status ?? DEFAULT;
  }

  getHttpStatusCode(): string {
    const {event} = this.props;

    const {tags} = event;

    if (!Array.isArray(tags)) {
      return '';
    }

    const tag = tags.find(tagObject => tagObject.key === 'http.status_code');

    if (!tag) {
      return '';
    }

    return tag.value;
  }

  render() {
    const event = this.getTransactionEvent();

    if (!event) {
      return null;
    }

    const label = `${this.getHttpStatusCode()} ${this.getRootSpanStatus()}`.trim();

    return (
      <Container>
        <Header>
          <SectionHeading>{t('Status')}</SectionHeading>
        </Header>
        <div>{label}</div>
      </Container>
    );
  }
}

const Container = styled('div')`
  color: ${p => p.theme.subText};
  font-size: ${p => p.theme.fontSizeMedium};
  margin-bottom: ${space(4)};
`;

const Header = styled('div')`
  display: flex;
  align-items: center;
`;

export default RootSpanStatus;
