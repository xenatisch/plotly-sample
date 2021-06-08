import { dropLeadingZeros, hexToRgb } from "common/utils";
import { movingAverage } from "common/stats";


export const
    colours = [
        '#5694CA',  // Base blue
        '#ABCBE5',  // Base blue tint 1
        '#DEEAF4',  // Base blue tint 2
        '#003078',  // Dark blue
        '#8098BC',  // Dark blue tint 1
        '#CCD6E4',  // Dark blue tint 2
        '#B1B4B6',  // Grey
        '#D8DADB',  // Grey tint 1
        '#EFF0F0',  // Grey tint 2
        '#FFDD00',  // Yellow
        '#d4351c',  // Red
        '#009f56',  // green
];


export const scaleColours = [
    "#e0e543",
    "#74bb68",
    "#399384",
    "#2067AB",
    "#12407F",
    "#53084A",
    "#2B0226"
];


const processArrayField = ({ field, rawData, xKey }) => {

    const filterKey = field?.filters?.parameter;
    const filterPassValue = field?.filters?.value;
    const baseValue = field?.value;
    const outputMetric = field?.metric;

    if ( !Array.isArray(rawData) ) return [];

    return rawData
        ?.filter(row => (row?.[baseValue]?.length ?? 0) > 0)
        ?.map(row => ({
                [xKey]: row?.[xKey],
                [baseValue]: row?.[baseValue]
                    ?.filter(nestedRow => nestedRow?.[filterKey] === filterPassValue)
            })
        )
        ?.reduce((acc, row) =>
            [
                ...acc,
                {
                    [baseValue]: row?.[baseValue]?.[0]?.[outputMetric] ?? null,
                    [xKey]: row?.[xKey]
                }
            ],
            []
        )
        ?? []

};  // processArrayField


const processHighlightedField = ({ field, index, xData, yData }) => {

    let {
        from: hlFrom = NaN,
        to: hlTo = NaN,
        colour: hlColour = index,
        label: hlLabel = field.label
    } = field?.highlight ?? {};

    hlFrom = hlFrom < 0 ? yData.length + hlFrom : hlFrom;
    hlTo = hlTo < 0
        ? yData.length - hlTo
        : hlTo === 0 ? yData.length : hlTo;

    let highlightedY = [...yData].reverse().slice(hlFrom, hlTo);
    let highlightedX = [...xData].reverse().slice(hlFrom, hlTo);

    const highlightedSection = {
        name: hlLabel,
        x: highlightedX,
        y: highlightedY,
        type: field?.type ?? "bar",
        marker: {
            color: colours[hlColour]
        }
    };

    yData = yData.reverse().filter((val, ind) => ind < hlFrom || ind >= hlTo);
    xData = xData.reverse().filter((val, ind) => ind < hlFrom || ind >= hlTo);

    return {
        xData,
        yData,
        highlightedSection
    }

};  // processHighlightedField


const processGenericField = ({ field, index, xData, yData }) => {

    const baseColour = colours[field?.colour ?? index];
    const { r, g, b } = hexToRgb(colours[field?.colour ?? index]);

    // `hl` represents the `highlight` field.
    let plotFeatures;

    switch ( field.type ) {

        case "line":
            plotFeatures = {
                type: field.type,
                mode: 'lines',
                ...(field?.fill ?? true)
                    ? {
                        fill: 'tozeroy',
                        fillcolor: `rgba(${ r },${ g },${ b },${ field?.solidFill ? 1 : 0.1})`
                    }:
                    {},
                line: {
                    width: 3,
                    color: colours[field?.colour ?? index]
                }
            };
            break;

        case "bar":
        default:
            plotFeatures = {
                type: field.type,
                marker: {
                    color: baseColour
                }
            }
            break;

    }

    const trimLength = (field?.rollingAverage?.clipEnd ?? 0) + 3;

    yData = (field.rollingAverage && (typeof field.rollingAverage === 'object'))
        ? [
            ...new Array(trimLength).fill(null),
            ...movingAverage(yData, field?.rollingAverage?.window ?? 7)
                .slice(trimLength, yData.length),
        ]
        : field.rollingAverage === true
            ? movingAverage(yData, 7)
            : yData

    return {
        name: field.label,
        x: xData,
        y: yData,
        ...(field?.overlaying)
            ? {
                yaxis: "y2",
                overlaying: field.overlaying,
                side: field.side,
            }
            : {},
        ...plotFeatures
    }

};  // processGenericField


export const getPlotData = ( fields: Array<{}>, rawData, xKey="date" ) => {

    const graphObjects = [];

    for ( let index = 0; index < fields.length; index ++ ) {

        const field = fields[index];

        let xData, yData, data;

        if ( field?.isArray ) {
            data = processArrayField({ field, rawData, xKey })
        }

        data = dropLeadingZeros(data || rawData, field.value);
        xData = data?.map(item => item?.[xKey] ?? null) ?? [];
        yData = data?.map(variable => variable?.[field.value] ?? null) ?? [];

        if ( field?.highlight ) {
            const highlightedData = processHighlightedField({ field, index, xData, yData });
            xData = highlightedData.xData;
            yData = highlightedData.yData;
            graphObjects.push(highlightedData.highlightedSection);
        }

        graphObjects.push(processGenericField({ field, index, xData, yData }));

    }

    return graphObjects

};  // getPlotData
