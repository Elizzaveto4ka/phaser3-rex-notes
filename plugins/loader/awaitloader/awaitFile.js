const FILE_POPULATED = Phaser.Loader.FILE_POPULATED;

class AwaitFile extends Phaser.Loader.File {
    // constructor(loader, fileConfig) {
    //     super(loader, fileConfig);
    // }

    load() {
        if (this.state === FILE_POPULATED) {
            //  Can happen for example in a JSONFile if they've provided a JSON object instead of a URL
            this.loader.nextFile(this, true);
        } else {
            // start loading task
            var config = this.config;
            var callback = config.callback;
            var scope = config.scope;
            var successCallback = this.onLoad.bind(this);
            var failureCallback = this.onError.bind(this);
            if (callback) {
                if (scope) {
                    callback.call(scope, successCallback, failureCallback);
                } else {
                    callback(successCallback, failureCallback);
                }
            } else {
                this.onLoad();
            }
        }
    }

    onLoad() {
        this.loader.nextFile(this, true);
    }

    onError() {
        this.loader.nextFile(this, false);
    }
}

export default AwaitFile;