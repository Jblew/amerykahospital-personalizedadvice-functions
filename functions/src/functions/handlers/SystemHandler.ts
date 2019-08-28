import * as functions from "firebase-functions";

import { Log } from "../../Log";

import { ErrorWrappingHandler } from "./system/ErrorWrappingHandler";
import { UpstreamHandler } from "./UpstreamHandler";

export class SystemHandler<INPUT_TYPE, RESULT_TYPE> implements SystemHandler<INPUT_TYPE, RESULT_TYPE> {
    private log = Log.tag("SystemHandler");
    private upstreamHandler: UpstreamHandler<INPUT_TYPE, RESULT_TYPE>;
    private props: SystemHandler.Props;
    private handlerStats: SystemHandler.HandlerStats = SystemHandler.HandlerStats.ZERO;

    public constructor(props: SystemHandler.Props, upstreamHandler: UpstreamHandler<INPUT_TYPE, RESULT_TYPE>) {
        this.props = props;
        this.upstreamHandler = this.decorateWithErrorWrappingHandler(upstreamHandler);

        this.recordHandlerInitialize();
    }

    public async handle(data: INPUT_TYPE, context: functions.https.CallableContext): Promise<RESULT_TYPE> {
        let runStats: SystemHandler.RunStats = SystemHandler.RunStats.ZERO;
        runStats = this.recordStart(runStats);

        try {
            return await this.upstreamHandler.handle(data, context);
        } finally {
            runStats = this.recordFinish(runStats);
        }
    }

    private decorateWithErrorWrappingHandler(handler: UpstreamHandler<INPUT_TYPE, RESULT_TYPE>) {
        return new ErrorWrappingHandler<INPUT_TYPE, RESULT_TYPE>(handler);
    }

    private recordHandlerInitialize() {
        this.handlerStats.handlerInitializeTimeMs = Date.now();
        this.handlerStats.handlerInitializeTimeISO = new Date().toISOString();
        this.log.info(`SystemHandler for ${this.props.functionName} initialized`, this.logMeta());
    }

    private recordStart(runStats: SystemHandler.RunStats): SystemHandler.RunStats {
        this.handlerStats.numOfRuns++;

        runStats.startTimeMs = Date.now();
        this.log.info(`Function ${this.props.functionName} started`, this.logMeta(runStats));
        return runStats;
    }

    private recordFinish(runStats: SystemHandler.RunStats): SystemHandler.RunStats {
        runStats.finishTimeMs = Date.now();
        runStats.tookMs = runStats.startTimeMs - runStats.finishTimeMs;
        this.log.info(
            `Function ${this.props.functionName} finished. Took ${runStats.tookMs}ms`,
            this.logMeta(runStats),
        );
        return runStats;
    }

    private logMeta(runStats?: SystemHandler.RunStats): { [x: string]: any } {
        return { function: this.props.functionName, ...this.props, handlerStats: this.handlerStats, runStats };
    }
}

export namespace SystemHandler {
    export interface Props {
        functionName: string;
    }

    export interface RunStats {
        startTimeMs: number;
        finishTimeMs: number;
        tookMs: number;
    }

    export namespace RunStats {
        export const ZERO: RunStats = {
            startTimeMs: -1,
            finishTimeMs: -1,
            tookMs: -1,
        };
    }

    export interface HandlerStats {
        handlerInitializeTimeMs: number;
        handlerInitializeTimeISO: string;
        numOfRuns: number;
    }

    export namespace HandlerStats {
        export const ZERO: HandlerStats = {
            handlerInitializeTimeMs: -1,
            handlerInitializeTimeISO: "",
            numOfRuns: 0,
        };
    }
}
