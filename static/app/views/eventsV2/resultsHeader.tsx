import React from 'react';
import styled from '@emotion/styled';
import {Location} from 'history';

import {fetchSavedQuery} from 'app/actionCreators/discoverSavedQueries';
import {Client} from 'app/api';
import {CreateAlertFromViewButton} from 'app/components/createAlertButton';
import * as Layout from 'app/components/layouts/thirds';
import TimeSince from 'app/components/timeSince';
import {t} from 'app/locale';
import space from 'app/styles/space';
import {Organization, SavedQuery} from 'app/types';
import EventView from 'app/utils/discover/eventView';
import withApi from 'app/utils/withApi';

import DiscoverBreadcrumb from './breadcrumb';
import EventInputName from './eventInputName';
import SavedQueryButtonGroup from './savedQuery';

type Props = {
  api: Client;
  organization: Organization;
  location: Location;
  errorCode: number;
  eventView: EventView;
  onIncompatibleAlertQuery: React.ComponentProps<
    typeof CreateAlertFromViewButton
  >['onIncompatibleQuery'];
};

type State = {
  savedQuery: SavedQuery | undefined;
  loading: boolean;
};

class ResultsHeader extends React.Component<Props, State> {
  state: State = {
    savedQuery: undefined,
    loading: true,
  };

  componentDidMount() {
    if (this.props.eventView.id) {
      this.fetchData();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.eventView &&
      this.props.eventView &&
      prevProps.eventView.id !== this.props.eventView.id
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const {api, eventView, organization} = this.props;
    if (typeof eventView.id === 'string') {
      this.setState({loading: true});
      fetchSavedQuery(api, organization.slug, eventView.id).then(savedQuery => {
        this.setState({savedQuery, loading: false});
      });
    }
  }

  renderAuthor() {
    const {eventView} = this.props;
    const {savedQuery} = this.state;
    // No saved query in use.
    if (!eventView.id) {
      return null;
    }
    let createdBy = ' \u2014 ';
    let lastEdit: React.ReactNode = ' \u2014 ';
    if (savedQuery !== undefined) {
      createdBy = savedQuery.createdBy?.email || '\u2014';
      lastEdit = <TimeSince date={savedQuery.dateUpdated} />;
    }
    return (
      <Subtitle>
        {t('Created by:')} {createdBy} | {t('Last edited:')} {lastEdit}
      </Subtitle>
    );
  }

  render() {
    const {
      organization,
      location,
      errorCode,
      eventView,
      onIncompatibleAlertQuery,
    } = this.props;
    const {savedQuery, loading} = this.state;

    return (
      <StyledLayoutHeader>
        <StyledHeaderContent>
          <DiscoverBreadcrumb
            eventView={eventView}
            organization={organization}
            location={location}
          />
          <EventInputName
            savedQuery={savedQuery}
            organization={organization}
            eventView={eventView}
          />
          {this.renderAuthor()}
        </StyledHeaderContent>
        <StyledHeaderActions>
          <SavedQueryButtonGroup
            location={location}
            organization={organization}
            eventView={eventView}
            savedQuery={savedQuery}
            savedQueryLoading={loading}
            disabled={errorCode >= 400 && errorCode < 500}
            updateCallback={() => this.fetchData()}
            onIncompatibleAlertQuery={onIncompatibleAlertQuery}
          />
        </StyledHeaderActions>
      </StyledLayoutHeader>
    );
  }
}

const Subtitle = styled('h4')`
  font-size: ${p => p.theme.fontSizeLarge};
  font-weight: normal;
  line-height: 1.4;
  color: ${p => p.theme.gray300};
  margin: 0;
  margin-top: ${space(2)};
`;

const StyledLayoutHeader = styled(Layout.Header)`
  padding-left: 0;
  @media (min-width: ${p => p.theme.breakpoints[1]}) {
    padding-left: 0;
  }
`;

const StyledHeaderContent = styled(Layout.HeaderContent)`
  padding-left: ${space(2)};
  @media (min-width: ${p => p.theme.breakpoints[1]}) {
    padding-left: ${space(4)};
  }
`;

const StyledHeaderActions = styled(Layout.HeaderActions)`
  padding-left: ${space(2)};
  @media (min-width: ${p => p.theme.breakpoints[1]}) {
    padding-left: 0;
  }
`;

export default withApi(ResultsHeader);
