export type Factory<TYPE> = () => TYPE;

export namespace Factory {
    export type Parametrized<PARAM, TYPE> = (param: PARAM) => TYPE;
}
