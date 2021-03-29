import { EventHandler } from "eventcontainer";
import SkyUtil from "skyutil";
import SkyNode from "./SkyNode";

export type Style = { [key: string]: string | number };

export default class DomNode<EL extends HTMLElement = HTMLElement> extends SkyNode {

    public parent: DomNode | undefined;
    public children: DomNode[] = [];

    private domEventMap: {
        [eventName: string]: {
            eventHandler: EventHandler,
            domEventHandler: EventHandler,
        }[],
    } = {};

    constructor(public domElement: EL) {
        super();
    }

    public style(style: Style): void {
        for (const [key, value] of Object.entries(style)) {
            if (typeof value === "number" && key !== "zIndex" && key !== "opacity") {
                (this.domElement.style as any)[key] = `${value}px`;
            } else {
                (this.domElement.style as any)[key] = value;
            }
        }
    }

    public on(eventName: string, eventHandler: EventHandler): void {
        if (this.domEventMap[eventName] === undefined) {
            this.domEventMap[eventName] = [];
        }
        const domEventHandler = (event: Event) => eventHandler(event, this);
        this.domEventMap[eventName].push({ eventHandler, domEventHandler });
        this.domElement.addEventListener(eventName, domEventHandler);
        super.on(eventName, eventHandler);
    }

    public off(eventName: string, eventHandler: EventHandler): void {
        const domEvents = this.domEventMap[eventName];
        if (domEvents !== undefined) {
            const domEvent = domEvents.find((de) => de.eventHandler === eventHandler);
            if (domEvent !== undefined) {
                this.domElement.removeEventListener(eventName, domEvent.domEventHandler);
                SkyUtil.pull(domEvents, domEvent);
                if (domEvents.length === 0) {
                    delete this.domEventMap[eventName];
                }
            }
        }
        super.off(eventName, eventHandler);
    }

    public async fireEvent(eventName: string, ...params: any[]): Promise<void> {
        this.domElement.dispatchEvent(new Event(eventName));
        return super.fireEvent(eventName, ...params);
    }

    public appendText(text: string): void {
        this.domElement.append(text);
    }

    public appendTo(node: DomNode, index?: number): this {
        if (index !== undefined && index < node.children.length) {
            node.domElement.insertBefore(this.domElement, node.children[index].domElement);
        } else {
            node.domElement.append(this.domElement);
        }
        return super.appendTo(node, index);
    }

    public exceptFromParent(): void {
        if (this.parent !== undefined) {
            this.parent.domElement.removeChild(this.domElement);
        }
        super.exceptFromParent();
    }

    public delete(): void {
        (this.domEventMap as unknown) = undefined;
        super.delete();
    }
}