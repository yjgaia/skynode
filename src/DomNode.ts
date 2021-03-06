import { EventHandler } from "eventcontainer";
import SkyNode from "./SkyNode";

export default class DomNode<T extends HTMLElement> extends SkyNode {

    protected children: DomNode<any>[] = [];

    constructor(protected domElement: T) {
        super();
    }

    public append(...nodes: DomNode<any>[]): void {
        super.append(...nodes);
        const fragment = new DocumentFragment();
        for (const node of nodes) {
            fragment.append(node.domElement);
        }
        this.domElement.append(fragment);
    }

    public appendTo(node: DomNode<any>, index: number): void {
        super.appendTo(node, index);
        if (index < this.children.length) {
            this.domElement.insertBefore(node.domElement, this.children[index].domElement);
        } else {
            this.domElement.append(node.domElement);
        }
    }

    public on(eventName: string, eventHandler: EventHandler) {
        this.domElement.addEventListener(eventName, eventHandler);
        super.on(eventName, eventHandler);
    }

    public off(eventName: string, eventHandler: EventHandler) {
        this.domElement.removeEventListener(eventName, eventHandler);
        super.off(eventName, eventHandler);
    }

    public delete(): void {
        this.domElement.remove();
        super.delete();
    }
}