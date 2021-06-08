// @flow

import React from "react";

import useResponsiveLayout from "hooks/useResponsiveLayout";
import { PlotContainer } from "./Plotter.styles";

import numeral from "numeral";
import Plotly from "plotly.js";
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);


export const BasePlotter = ({ data, layout = {}, xaxis = {}, yaxis = {},
                                                  config = {}, margin = {}, style = {},
                                                  isTimeSeries = true, SrOnly = "",
                                                  ...props }) => {

    const width = useResponsiveLayout(640);

    let yAxisRef = {
        fixedragne: false,
        tickslen: 0,
        ticks: width === "desktop" ? "outside" : "inside",
        tickson: "boundaries",
        ticklen: 'labels',
        tickcolor: "#f1f1f1",
        tickformat: width === "desktop" ? ',.2r' : '3s',
        tickfont: {
            family: `"GDS Transport", Arial, sans-serif`,
            size: width === "desktop" ? 13 : 10,
            color: "#6B7276",
        },
    };

    let tickvals, ticktext, tickmode = undefined;

    if ( layout?.barmode === "logy" ) {
        tickmode = 'array';

        const thresholds = [-1000, -10, 0, 10, 100, 1000, 10000, 100000, 1000000, 10000000];
        const minVal = Math.min(...data[0].y);
        const maxVal = Math.max(...data[0].y);

        ticktext = [
            minVal,
            ...thresholds.filter(value => value > minVal && value < maxVal),
            maxVal
        ];

        for ( const item of data ) {
            item.text = item.y;

            item.y = item.y.map(val =>
                val >= 0
                    ? Math.log(val)
                    : -Math.log(Math.abs(val))
            );

            item.hovertemplate ='%{text:.1f}';
        }

        tickvals = ticktext.map(val =>
            val >= 0
                ? val === 0
                ? 0
                : Math.log(val)
                : -Math.log(Math.abs(val))
        );

    }

    for ( const row of data ) {
        if ( "overlaying" in row ) {
            yAxisRef = {
                ...yAxisRef,
                rangemode: "tozero",
            };

            layout = {
                yaxis2: {
                    ...yAxisRef,
                    overlaying: row.overlaying,
                    side: row.side,
                    rangemode: "tozero",
                    showgrid: false,

                }
            };

            margin = {
                r: 50,
            };

        }

        for ( const value of row?.y ?? []) {

            if ( row?.showlegend === false || row?.type === 'heatmap' ) continue;
            if ( !(row?.hovertemplate ?? null) ) row.hovertemplate = [];

            row.hovertemplate.push(numeral(value).format("0,0.[0]"));

        }
    }

    return <PlotContainer className={ "govuk-grid-row" }
                          aria-label={ "Displaying a graph of the data" }>
        <p className={ "govuk-visually-hidden" }>
            {"[Screen-reader text]"}
        </p>
        <Plot
            data={ data }
            config={ {
                showLink: false,
                responsive: true,
                displaylogo: false,
                modeBarButtonsToRemove: [
                    "autoScale2d",
                    "toggleSpikelines",
                    "hoverClosestCartesian",
                    "pan2d",
                    "select2d",
                    "lasso2d",
                ],
                toImageButtonOptions: {
                    format: 'png',
                    filename: 'export',
                    height: 989,
                    width: 1600,
                    scale: 4
                },
                ...config
            } }
            useResizeHandler={ true }
            style={ { display: "block", height: 350, ...style } }
            layout={ {
                hovermode: "x unified",
                legend: {
                    orientation: 'h',
                    font: {
                        family: `"GDS Transport", Arial, sans-serif`,
                        size: width === "desktop" ? 15 : 12,
                    },
                    xanchor: 'auto',
                    y: -.2
                },
                showlegend: true,
                margin: {
                    l: width === "desktop" ? 85 : 30,
                    r: width === "desktop" ? 10 : 5,
                    b: 25,
                    t: 10,
                    pad: 0,
                    ...margin
                },
                xaxis: {
                    showgrid: false,
                    zeroline: false,
                    showline: false,
                    fixedrange: width !== "desktop",
                    tickslen: 10,
                    ticks: "outside",
                    tickson: "boundaries",
                    ticklen: 'labels',
                    type: isTimeSeries ? "date" : "category",
                    tickformat: '%d %b',
                    tickfont: {
                        family: `"GDS Transport", Arial, sans-serif`,
                        size: width === "desktop" ? 14 : 10,
                        color: "#6B7276"
                    },
                    ...xaxis
                },
                yaxis: {
                    tickmode,
                    tickvals,
                    ticktext,
                    ...yAxisRef,
                    ...yaxis
                },
                plot_bgcolor: "rgba(231,231,231,0)",
                paper_bgcolor: "rgba(255,255,255,0)",
                ...layout
            } }
            { ...props }
        />
    </PlotContainer>;

}; // Plotter
