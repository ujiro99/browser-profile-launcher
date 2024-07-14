export namespace profile {
	
	export class Profile {
	    name: string;
	    shortcut_name: string;
	    browser: string;
	    directory: string;
	    ico_path: string;
	
	    static createFrom(source: any = {}) {
	        return new Profile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.shortcut_name = source["shortcut_name"];
	        this.browser = source["browser"];
	        this.directory = source["directory"];
	        this.ico_path = source["ico_path"];
	    }
	}

}

