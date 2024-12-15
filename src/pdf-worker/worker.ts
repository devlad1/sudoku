import { generate } from "@pdfme/generator";
import { image } from "@pdfme/schemas";
import { Plugins, Template } from "@pdfme/common";

const inputs: Record<string, any>[] = [{}];
const plugins: Record<string, { ui?: any; pdf?: any; propPanel?: any; }> & Plugins = {
    image
};

self.onmessage = async (event: MessageEvent<Template>) => {
    const template = event.data
    const binaryPdf = await generate({ template: template, inputs: inputs, plugins: plugins })

    postMessage(binaryPdf)
  };
  