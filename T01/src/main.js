import { add } from './math.js'
import { Pane } from 'tweakpane'

window.addEventListener("load", () => {
    const params = {
        factor: 30,
        title: "rollup test",
        color: "#e51a00"
    }

    const pane = new Pane();
    pane.addBinding(params, "factor");
    pane.addBinding(params, "title");
    pane.addBinding(params, "color");

    console.log("abb");
    console.log(add(1, 3));

    setInterval(() => {
        const str = JSON.stringify(params);
        console.log(str);

        /*
        try {
            const obj = JSON.parse("xyz");
        } catch (err) {
            console.log(err);
        }
        */
    }, 1000)
})
