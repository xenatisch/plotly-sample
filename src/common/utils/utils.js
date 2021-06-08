import moment from "moment";
import { max, group } from "d3-array";


export const sort = (a, b) => {

    return (a < b) || -((a > b) || 0)

};  // sort


export const sortByDate = (a, b) => {

    const
        dateA = new Date(a),
        dateB = new Date(b);

    return sort(dateA, dateB)

};  // sortByDate

export const sortRegion = (a, b) => {

    return a["name"].localCompare(b["name"]);

};  // sortRegion


export const dateRange = (startDate: string, stopDate: string, step: number = 1, unit: string = 'days'): Array<string> => {

    const
        stop = moment(stopDate),
        days = stop.diff(moment(startDate), unit),
        dateArray = Array(days).fill("YYYY-MM-DD");

    let currentDate = moment(startDate);

    for ( let index = 0; index <= days; index ++ ) {
        dateArray[index] = currentDate.format('YYYY-MM-DD');
        currentDate = currentDate.add(step, unit);
    }

    return dateArray;

}; // getDates


export const getParams = (uri: string, separator: string="&"): ParsedParams => {

    return decodeURIComponent(uri)
        .replace(/(%23|#).*$/ig, "")
        .replace("?", "")
        .replace(/\w{1,2}clid=[^&]&?/i, "")
        .split(separator)
        .reduce((acc, item) => {
            const found = /^([a-z]+)([=<>!]{1,2})(.+)$/i.exec(item)

            if (!found) return acc;

            return [
                ...acc,
                {
                    key: found[1],
                    value: found[3],
                    sign: found[2]
                }
            ]
        }, [])

}; // getParams


export const heading2id = ( heading: string ): string => {

    return heading
        .toLowerCase()
        .replace(/["')]/g, "")
        .replace(/[\s.(&,]+/g, "_")

};  // heading2id


export const getParamValueFor = (params: Array<ParsedParams>, keyName: string, defaultValue: string|null=null): string | null => {

    return params
        .reduce((acc, { key, value }) =>
            key === keyName ? value : acc,
            defaultValue
        )

};  // getParamValueFor


export const firstObjWithMax = ( arr: Array<{[string|number]: [string|number|null]}>, key: ([string|number]) => [string|number|null] ) => {

    const maxValue = max(arr, key);

    for ( const item of arr )
        if (key(item) === maxValue) return item;

};


export const hexToRgb = (hex: string): RGB => {

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) return null;

    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    }

}; // hexToRgb


export const strFormat = (str, { args=[], kwargs={} }) => {

    let unkeyedIndex = 0;

    return str.replace(/{(\w*)}/g, ( match, key ) => {

        if ( key === '' ) {

            key = unkeyedIndex;
            unkeyedIndex++
        }

        if ( key === +key ) {

            return args[key] !== 'undefined'
                ? args[key]
                : match;

        } else {

            if ( kwargs.hasOwnProperty(key) ) return kwargs[key];

            return match

        }

    })

};  // strFormat



/**
 * Iterates through the data until it finds a valid value (not null) and
 * returns the value with its corresponding date:
 *
 *      { date: 'DATE', value: VALUE }
 *
 * If no valid value is found, it will return:
 *
 *      { date: null, value: null }
 *
 * @param data { Array<{ [string]: string} > | number | null }
 *        Must always be sorted by date (descending).
 *
 * @param valueKey { { date: string | null  , value: string | number | null } }
 *        Key for the value whose validity is tested for a given date.
 *
 * @returns { { date: string | null, value: string | number | null } }
 */
export const getMaxDateValuePair = ( data: Array<{ [string]: string | number | null }>, valueKey: string ): { date: string | null, value: string | number | null } =>  {

    if ( !valueKey || !data ) return { date: null, value: null };

    for ( const { [valueKey]: value, date } of data ) {

        if ( value )
            return { date: moment(date).format("dddd, D MMMM YYYY"), value: value };

    }

    return { date: null, value: null }

};  // getMaxDateValuePair


/**
 * Converts a ``Map`` to a JSON object.
 *
 * @param map { Map }
 * @returns { Object }
 */
export const map2Object = ( map ): Object => {

    const out = Object.create(null)

    map.forEach((value, key) => {
        out[key] = value instanceof Map
            ? map2Object(value)
            : value
    })

    return out

};  // map2Object


export const groupBy = (arr, key) => {

    return map2Object(group(arr, key))

};  // groupBy


/**
 *
 * .. attention::
 *      The ``data`` variable is expected to be ordered (descending) in
 *      using the desired ``key``.
 *
 * @param data { Array<{ [any]: any }> }
 * @param keys { any }
 * @returns { Array<{ [any]: any }> }
 */
export const dropLeadingZeros = (data: Array<{ [any]: any }>, ...keys) => {

    let sum = 0;

    for ( let index = data.length - 1; index > 0; index-- ) {

        sum = keys.reduce((acc, key) => acc + data[index][key], 0);

        if ( sum !== 0 ) return data.slice(0, index + 1);

    }

    return []

};  // dropLeadingZeros
