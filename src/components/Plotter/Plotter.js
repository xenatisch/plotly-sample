// @flow

import React from "react";
import { BasePlotter } from "./BasePlot";


const Plotter = ({ type = "generic", ...props }) => {

    switch ( type ) {
        default:
            return <BasePlotter { ...props }/>;
    }

};

export default Plotter;
