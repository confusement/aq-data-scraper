/**
 * Get Status of all systems and currently running jobs and performance metrics
 */
async function handleGetStatus(query){
    return {
        metrics:{
            "RAM":256,
            "CPU":56
        },
        "systems":{
            
        }
    }
} 
module.exports = {
    "handleGetStatus":handleGetStatus
}