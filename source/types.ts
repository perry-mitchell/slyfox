export type BindTarget = null | Object;

export interface EntryPoint {
    document: Document;
    window: Window;
}

export interface EntryPoints {
    top: EntryPoint;
    safe: EntryPoint;
}
