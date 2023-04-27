var getClassGlobalStorage = null;

/**
 *
 * @returns {Options}
 */
function getClassStorage()
{
    if(getClassGlobalStorage === null){
        getClassGlobalStorage = new StorageClass();
    }
    return getClassGlobalStorage;
}
class StorageClass{
    constructor()
    {
    }

    /**
     *
     * @param key
     * @returns {string}
     */
    get(key)
    {
        let data = localStorage.getItem(key);
        if(typeof data !== null){
            if(isJsonString(data)) {
                return JSON.parse(data);
            }
            return data;
        }
        return null;
    }

    /**
     *
     * @param key
     * @param data
     * @returns {StorageClass}
     */
    save(key, data)
    {
        if(typeof data == 'object' || typeof data == 'array' ){
            data = JSON.stringify(data);
        }

        localStorage.setItem(key, data);
        return this;
    }

    /**
     *
     * @param key
     * @returns {StorageClass}
     */
    remove(key)
    {
        localStorage.removeItem(key);
        return this;
    }

    /**
     *
     * @returns {StorageClass}
     */
    reset()
    {
        localStorage.clear();
        return this;
    }
}
var storage = getClassStorage();