class Utils {

    // QUERY BUILDER

    static buildQueryAttributes(opts, prefix) {
        let all = (prefix) ? prefix + "*" : "*";
        if (opts.attributes) {
            if (prefix) {
                for (let i = 0; i < opts.attributes.length; ++i) {
                    opts.attributes[i] = prefix + opts.attributes[i];
                }
            }
            return opts.attributes.join(", ");
        } else {
            return all;
        }
    }

    static buildQueryFilter(opts, extend) {
        let whereOrAnd = (extend) ? " AND " : " WHERE ";
        return (opts.filter) ? whereOrAnd + opts.filter: "";
    }

    static buildQuerySortBy(opts) {
        if (opts.sortBy) {
            return " ORDER BY " + opts.sortBy + ((opts.sortOrder === "desc") ? " DESC" : " ASC");
        } else {
            return "";
        }
    }

    static buildQueryLimit(opts) {
        let startIndex = opts.startIndex;
        let count = opts.count;
        if (startIndex && count) {
            return " Limit " + startIndex + ", " + count;
        } else if (startIndex && !count) {
            return " Limit " + startIndex + ", 10000000000";
        } else if (!startIndex && count) {
            return " Limit " + count;
        } else {
            return "";
        }
    }

    // SWAP MAPPING (SWAP KEY WITH VALUE)

    static swapMapping(mapping) {
        var obj = {};
        for(var key in mapping) {
            obj[mapping[key]] = key;
        }
        return obj;
    }

}

module.exports = Utils;