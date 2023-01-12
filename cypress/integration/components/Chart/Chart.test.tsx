import React from "react";
import { mount } from "cypress/react";
import ChartView from "../../../../src/components/Chart/Chart.view";
import Text from "../../../../src/components/Text";

it("Should be able to animate each line going up");
it("Should be able to draw more than one line");
it.only(`Should be able to map the value to chart correctly
Should be able to display tooltip on relevant points`, () => {
  const chain = cy.mountChain(() => {
    return (
      <div
        style={
          {
            "--primary-color": "#ff0000",
            height: "100vh",
            width: "100vw",
          } as any
        }
      >
        <ChartView
          bounds={[
            [2020, 2030, 1],
            [5, 30, 5],
          ]}
          style={[
            {
              lineColor: "rgb(238, 176, 51)",
              pointColor: "#0000",
              textColor: "#000",
            },
            {
              lineColor: "rgb(23, 107, 51)",
            },
            {
              lineColor: "rgb(6, 41, 51)",
            },
          ]}
          points={[
            [
              [2025.4, 20.3, <h1>klasndalns</h1>],
              [2030, 30, <h1>klasndalns</h1>],
            ],
          ]}
          data={[
            [
              [2020, 7],
              [2021.7, 8],
              [2024.7, 19],
              [2029, 27],
              [2030, 30],
            ],
            [
              [2020, 7],
              [2021.7, 8.2],
              [2026, 17],
              [2027, 18],
              [2030, 24],
            ],
            [
              [2020, 7],
              [2021.7, 7.8],
              [2022, 7.6],
              [2023, 10],
              [2024, 11],
              [2025, 13],
              [2028, 15],
              [2028.8, 17],
              [2030, 18],
            ],
          ]}
          label={{
            x: (val) => <Text type={"error"}>{val}</Text>,
            y: (val) => <Text type={"caption"}>{val}</Text>,
          }}
        />
        <ChartView
          bounds={[
            [0, 100, 5],
            [0, 100, 5],
          ]}
          data={[
            [
              [0, 0],
              [20, 10],
              [50, 50],
              [70, 80],
              [100, 100],
            ],
          ]}
          label={{
            x: (val) => <Text type={"boldTitleBig"}>{val}</Text>,
            y: (val) => <Text type={"boldTitleBig"}>{val}</Text>,
          }}
        />
        <ChartView
          bounds={[
            [0, 100, 20],
            [0, 100, 20],
          ]}
          data={[
            [
              [0, 0],
              [20, 10],
              [50, 50],
              [70, 80],
              [100, 100],
            ],
          ]}
          label={{
            x: (val) => <Text type={"highlightTitle"}>{val}</Text>,
            y: (val) => <Text type={"highlightTitle"}>{val}</Text>,
          }}
        />
        <ChartView
          bounds={[
            [0, 100, 10],
            [0, 100, 10],
          ]}
          data={[
            [
              [0, 0],
              [20, 10],
              [50, 50],
              [70, 80],
              [100, 100],
            ],
          ]}
          label={{
            x: (val) => <Text type={"highlight"}>{val}</Text>,
            y: (val) => <Text type={"highlight"}>{val}</Text>,
          }}
        />
      </div>
    );
  });

  chain.remount();
});
