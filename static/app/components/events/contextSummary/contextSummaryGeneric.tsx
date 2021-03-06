import React from 'react';
import styled from '@emotion/styled';

import AnnotatedText from 'app/components/events/meta/annotatedText';
import {getMeta} from 'app/components/events/meta/metaProxy';
import TextOverflow from 'app/components/textOverflow';
import {t} from 'app/locale';
import space from 'app/styles/space';

import ContextSummaryNoSummary from './contextSummaryNoSummary';
import generateClassName from './generateClassName';
import Item from './item';

type Props = {
  data: Data;
  unknownTitle: string;
};

type Data = {
  name: string;
  version?: string;
};

const ContextSummaryGeneric = ({data, unknownTitle}: Props) => {
  if (Object.keys(data).length === 0) {
    return <ContextSummaryNoSummary title={unknownTitle} />;
  }

  const renderValue = (key: keyof Data) => {
    const meta = getMeta(data, key);
    return <AnnotatedText value={data[key]} meta={meta} />;
  };

  const className = generateClassName(data.name, data.version);

  return (
    <Item className={className} icon={<span className="context-item-icon" />}>
      <h3>{renderValue('name')}</h3>
      <TextOverflow isParagraph>
        <Subject>{t('Version:')}</Subject>
        {!data.version ? t('Unknown') : renderValue('version')}
      </TextOverflow>
    </Item>
  );
};

export default ContextSummaryGeneric;

const Subject = styled('strong')`
  margin-right: ${space(0.5)};
`;
