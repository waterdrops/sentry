import React from 'react';
import * as ReactRouter from 'react-router';
import styled from '@emotion/styled';

import {openModal} from 'app/actionCreators/modal';
import ContextPickerModal from 'app/components/contextPickerModal';

type Project = {
  id: string;
  slug: string;
};

type Props = {
  /**
   * Path used on the redirect router if the user did not select a project
   */
  noProjectRedirectPath: string;
  /**
   * Path used on the redirect router if the user did select a project
   */
  nextPath: string;
  router: ReactRouter.InjectedRouter;
  projects: Project[];
};

function PickProjectToContinue({
  noProjectRedirectPath,
  nextPath,
  router,
  projects,
}: Props) {
  let navigating = false;

  const path = nextPath.includes('?') ? `${nextPath}&project=` : `${nextPath}?project=`;

  // if the project in URL is missing, but this release belongs to only one project, redirect there
  if (projects.length === 1) {
    router.replace(path + projects[0].id);
    return null;
  }

  openModal(
    modalProps => (
      <ContextPickerModal
        {...modalProps}
        needOrg={false}
        needProject
        nextPath={`${path}:project`}
        onFinish={pathname => {
          navigating = true;
          router.replace(pathname);
        }}
        projectSlugs={projects.map(p => p.slug)}
      />
    ),
    {
      onClose() {
        // we want this to be executed only if the user didn't select any project
        // (closed modal either via button, Esc, clicking outside, ...)
        if (!navigating) {
          router.push(noProjectRedirectPath);
        }
      },
    }
  );

  return <ContextPickerBackground />;
}

const ContextPickerBackground = styled('div')`
  height: 100vh;
  width: 100%;
`;

export default PickProjectToContinue;
