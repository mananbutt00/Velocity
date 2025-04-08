import React from 'react';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory-native';

const CustomChart = ({ chartWidth, height, animatedSpeedData, stroke }) => {
  return (
    <VictoryChart height={height} width={chartWidth}>
      <VictoryAxis
        dependentAxis
        tickFormat={() => ''}
        style={{
          axis: { stroke: '' },
          ticks: { stroke: '' },
          grid: { stroke: '' },
        }}
      />
      <VictoryLine
        style={{
          data: {
            stroke: stroke,
            strokeWidth: 2,
            strokeLinecap: 'round',
          },
        }}
        data={animatedSpeedData}
        animate={{ duration: 500 }}
      />
    </VictoryChart>
  );
};
export default React.memo(CustomChart);