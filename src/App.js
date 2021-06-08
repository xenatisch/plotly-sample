import 'App.css';
import Plotter from "components/Plotter";
import { getPlotData } from "common/utils";
import data from "assets/data.json"
import layout from "assets/layout.json"

function App() {

    const fields = layout?.cards?.[0]?.tabs?.[0]?.fields ?? {}
    const props = layout?.cards?.[0]?.tabs ?? [];
    const payloadData = data?.data ?? [];

    return (
        <div className="App">
            <Plotter type={ "generic" }
                     data={ getPlotData(fields, payloadData, "date") }
                     fields={ fields }
                     { ...props } />
        </div>
    );
}

export default App;
