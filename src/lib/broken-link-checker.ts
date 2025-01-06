import { CheckOptions, LinkChecker, LinkResult } from 'linkinator';
import { performance } from 'perf_hooks'; // with: npm i --save-dev @types/node
import * as fs from 'fs';
import { format } from "date-fns";

// date/time library: moments, dayjs, date-fns

export type BLC_MODE = 'extern' | 'intern' | 'all';

export interface BLC_Parameter_Interface {
    scan_source: string;
    write_to: string;
    date_format: string;
    mode: BLC_MODE;
    special_excludes: string[];
    checkOptions?: CheckOptions;
}

// TODO Deal with: '/#'
// http://localhost:1313/link-check/#ZgotmplZ

export class BLC_Parameter implements BLC_Parameter_Interface {
    public scan_source = 'http://localhost:1313/'; //! http://192.168.178.91:81;
    public write_to = './data/linksChecked.json';
    date_format = 'yyyy-MM-dd HH:mm:SSS';
    mode: BLC_MODE = 'extern';
    special_excludes = ['data:image/webp', 'blog:', 'troubleshooting:']; // special excludes: Links that start with...
    checkOptions = {
        path: '',
        // port: 8673,
        concurrency: 100,
        config: 'string',
        recurse: true,
        skip: 'www.googleapis.com', // userlike-cdn-widgets.s3-eu-west-1.amazonaws.com
        format: 'json',
        silent: true,
        verbosity: 'error',
        timeout: 0,
        // markdown: true,
        // serverRoot: './',
        directoryListing: true,
        retry: true,
        retryErrors: true,
        retryErrorsCount: 3,
        retryErrorsJitter: 5,
        // urlRewriteSearch: '/pattern/',
        // urlRewriteReplace: 'replacement',
        userAgent: 'Mozilla/4.0 (compatible; MSIE 6.0; MSIE 5.5; Windows NT 5.1)'
        // ,linksToSkip: [] // TODO check this for data and intrnalas
    };
}

export class BLC_Result {
    url: string = ''; // check the specific url that was scanned
    state: string = ''; // How did the scan go?  Potential states are `BROKEN`, `OK`, and `SKIPPED`
    status: number = 0; // What was the status code of the response?
    scantime: string = '';
    parent: string = ''; // What page linked here?
}

export interface BLC_Scan_Summary_Interface {
    scan_source: string;
    mode: BLC_MODE;
    special_excludes: string[];

    lastrun: string;
    runtime: number;
    runtime_unit: string;

    found: number;
    dropped: number;

    finished: boolean;

    total: number;

    ok: number; // from linkinator
    broken: number;
    skipped: number;

    links_ok: BLC_Result[];
    links_broken: BLC_Result[];
    links_skipped: BLC_Result[];
}

export class BLC_Scan_Summary implements BLC_Scan_Summary_Interface {
    scan_source: string = '';
    mode: BLC_MODE = 'extern';
    special_excludes: string[] = [];

    lastrun: string = '';
    runtime: number = 0;
    runtime_unit: string = 'min';

    found: number = 0;
    dropped: number = 0;

    finished: boolean = false;

    total: number = 0;

    ok: number = 0; // from linkinator
    broken: number = 0;
    skipped: number = 0;

    links_ok: BLC_Result[] = [];
    links_broken: BLC_Result[] = [];
    links_skipped: BLC_Result[] = [];
}

export class Duration {
    beginn_time = 0;
    duration_unit: string = 'min';

    start() {
        this.beginn_time = performance.now();
    }

    getDuration(): number {
        // TODO Depending on the value: Output meaningfully formatted result in ms, s, min, std
        let duration = (performance.now() - this.beginn_time) / 60000;
        return duration;
    }
    getDurationUnit(): string {
        return this.duration_unit;
    }
}

/**
 *
 */
export class Broken_Link_Checker {
    /**
     *
     * @param result - LinkResult
     * @param json_obj - BLC_Scan_Summary
     * @param item - BLC_Result
     */
    private static count_push(result: LinkResult, json_obj: BLC_Scan_Summary, item: BLC_Result) {
        json_obj.total = json_obj.total + 1;

        // console.log(item);

        if (result.state === 'OK') {
            json_obj.ok = json_obj.ok + 1;
            json_obj.links_ok.push(item);
        } else if (result.state === 'BROKEN') {
            json_obj.broken = json_obj.broken + 1;
            json_obj.links_broken.push(item);
        } else if (result.state === 'SKIPPED') {
            json_obj.skipped = json_obj.skipped + 1;
            json_obj.links_skipped.push(item);
        }
    }

    /**
     * TODO: http://localhost:1313/link-check/#ZgotmplZ <--- /#
     * @param item
     * @param param
     * @returns
     */
    private static isSpecialExclude(item: BLC_Result, param: BLC_Parameter) {
        let isExclude = false;

        for (const an_exclude of param.special_excludes) {
            if (item.url.startsWith(an_exclude)) {
                isExclude = true;
                console.log(`Skipping ${item.url}`);
                break;
            } else {
                console.log(`NO_Skipp ${item.url}`);
            }
        }

        return isExclude;
    }

    /**
     *
     * @param item BLC_Result
     * @param param
     * @param json_obj
     * @param result - LinkResult
     * @param json_array_wrapper
     * @param duration Duration
     */
    private static count_push_write(item: BLC_Result, param: BLC_Parameter, json_obj: BLC_Scan_Summary, result: LinkResult, json_array_wrapper: BLC_Scan_Summary[], duration: Duration) {
        if (!Broken_Link_Checker.isSpecialExclude(item, param)) {
            // no special excludes
            // Interim result
            // store
            Broken_Link_Checker.count_push(result, json_obj, item);

            // measure
            json_obj.runtime = duration.getDuration();
            json_obj.runtime_unit = duration.getDurationUnit();

            // Save Interim result
            fs.writeFileSync(param.write_to, JSON.stringify(json_array_wrapper, null, 4));
        }
    }

    /**
     *! Run the Scan.
     *
     * @param params BLC_Parameter | BLC_Parameter[]
     */
    public static async run(params: BLC_Parameter | BLC_Parameter[]) {
        // Runner
        if (Array.isArray(params)) {
            for (const job of params) {
                Broken_Link_Checker.run_job(Broken_Link_Checker.dice_parameters(job));
            }
        } else {
            Broken_Link_Checker.run_job(Broken_Link_Checker.dice_parameters(params));
        }
    }

    /**
     * Dice paramters and defaults into each other.
     *
     * @param job
     * @returns BLC_Parameter
     */
    private static dice_parameters(job: BLC_Parameter): BLC_Parameter {
        let param: BLC_Parameter = new BLC_Parameter();
        if (job !== null) {
            Object.assign(param, job);
        }
        return param;
    }

    /**
     *! Internal run Method.
     *
     * @param param
     */
    private static async run_job(param: BLC_Parameter) {
        if (fs.existsSync(param.write_to)) {
            fs.unlinkSync(param.write_to);
        }

        // Calculate runtime
        const duration = new Duration();
        duration.start();

        // create a new `LinkChecker` that we'll use to run the scan.
        const checker = new LinkChecker();

        // Build up Header with summary
        const json_obj = new BLC_Scan_Summary();
        json_obj.scan_source = param.scan_source;
        json_obj.mode = param.mode;
        json_obj.special_excludes = param.special_excludes;
        json_obj.lastrun = format(new Date(), param.date_format);

        const json_array_wrapper: BLC_Scan_Summary[] = [];
        json_array_wrapper.push(json_obj); // Hugo needs this for his data access-api.

        // Respond to the beginning of a new page being scanned
        checker.on('pagestart', (url) => {
            console.log(`Scanning ${url}`);
        });

        //* After a page is scanned, check out the results!
        checker.on('link', (result: LinkResult) => {
            json_obj.found = json_obj.found + 1;

            const result_item: BLC_Result = {
                url: result.url, // check the specific url that was scanned
                state: result.state, // How did the scan go?  Potential states are `BROKEN`, `OK`, and `SKIPPED`
                status: result.status, // What was the status code of the response?
                scantime: format(new Date(), param.date_format),
                parent: result.parent // What page linked here?
            };

            if (param.mode === 'intern') {
                if (result_item.url.startsWith(param.scan_source)) {
                    // count internal link
                    Broken_Link_Checker.count_push_write(result_item, param, json_obj, result, json_array_wrapper, duration);
                } else {
                    json_obj.dropped = json_obj.dropped + 1;
                }
            } else if (param.mode === 'extern') {
                if (!result_item.url.startsWith(param.scan_source)) {
                    // count external link
                    Broken_Link_Checker.count_push_write(result_item, param, json_obj, result, json_array_wrapper, duration);
                } else {
                    json_obj.dropped = json_obj.dropped + 1;
                }
            } else {
                // count all links
                Broken_Link_Checker.count_push_write(result_item, param, json_obj, result, json_array_wrapper, duration);
            }
        });

        //! Go ahead and start the scan! As events occur, we will see them above.
        param.checkOptions.path = param.scan_source; //! Pfad übergeben
        const result = await checker.check(param.checkOptions as CheckOptions);

        // Show the list of scanned links and their results
        console.log(result);

        // Check to see if the scan passed!
        console.log(result.passed ? 'PASSED :D' : 'FAILED :(');

        // How many links did we scan?
        console.log(`Scanned total of ${result.links.length} links!`);

        // The final result will contain the list of checked links, and the pass/fail
        const brokeLinksCount = result.links.filter((x) => x.state === 'BROKEN');
        console.log(`Detected ${brokeLinksCount.length} broken links.`);

        json_obj.runtime = duration.getDuration();
        json_obj.runtime_unit = duration.getDurationUnit();

        json_obj.finished = true;

        fs.writeFileSync(param.write_to, JSON.stringify(json_array_wrapper, null, 4));
    }
}