import React, {RefObject, useEffect, useRef, useState} from 'react';

import {debounce} from '@deckdeckgo/utils';

import {useSelector} from 'react-redux';

import {useTranslation} from 'react-i18next';
import i18next from 'i18next';

import styles from './WeekCharts.module.scss';

import {rootConnector} from '../../../store/thunks/index.thunks';
import {RootState} from '../../../store/reducers';
import {Summary as SummaryData, SummaryDay} from '../../../store/interfaces/summary';

import {format, toDateObj} from '../../../utils/utils.date';

const WeekCharts: React.FC = () => {
  const {t} = useTranslation('statistics');

  const chartsRef: RefObject<any> = useRef();
  const containerRef: RefObject<any> = useRef();

  const summary: SummaryData | undefined = useSelector((state: RootState) => state.summary.summary);

  const [data, setData] = useState<DeckdeckgoBarChartData[] | undefined>(undefined);

  useEffect(() => {
    if (window) {
      window.addEventListener('resize', debounce(drawChart));
    }

    return () => {
      if (window) {
        window.removeEventListener('resize', debounce(drawChart));
      }
    };
  }, []);

  useEffect(() => {
    loadChartsData();

    // eslint-disable-next-line
  }, [summary]);

  useEffect(() => {
    if (chartsRef && chartsRef.current) {
      chartsRef.current.data = data;

      drawChart();
    }

    // eslint-disable-next-line
  }, [data, chartsRef]);

  useEffect(() => {
    drawChart();

    // eslint-disable-next-line
  }, [containerRef, chartsRef]);

  async function drawChart() {
    if (!containerRef || !containerRef.current) {
      return;
    }

    if (!chartsRef || !chartsRef.current) {
      return;
    }

    const width: number = containerRef.current.offsetWidth - 64;

    if (width <= 0) {
      return;
    }

    const height: number = Math.min((width * 9) / 16, 264);

    await chartsRef.current.draw(width, height);
  }

  async function loadChartsData() {
    if (summary && summary.days && summary.days.length > 0) {
      await i18next.loadNamespaces('statistics');

      setData(
        summary.days.map((day: SummaryDay, index) => {
          const label: string | undefined = format(toDateObj(day.day));

          return {
            label: label !== undefined ? label : `${index}`,
            values: [
              {
                key: 0,
                label: label !== undefined ? label : `${index}`,
                value: day.milliseconds / 1000 / 60 / 60,
              },
            ],
          };
        })
      );
    } else {
      setData(undefined);
    }
  }

  return <>{renderContent()}</>;

  function renderContent() {
    if (data === undefined) {
      return undefined;
    }

    return (
      <>
        <h1
          dangerouslySetInnerHTML={{
            __html: t('charts.week.title'),
          }}></h1>
        <div ref={containerRef} className={styles.container + ' chart-container'}>
          {/*
            // @ts-ignore */}
          <deckgo-bar-chart ref={chartsRef} margin-top={0} margin-bottom={0} margin-left={128} margin-right={0} y-axis-min={8}></deckgo-bar-chart>
        </div>
      </>
    );
  }
};

export default rootConnector(WeekCharts);
