import {listChannelStats, listVideoStats} from '../../api/stats'

// Get data for channel and video to display graph

export const getVideoStats = async (id : string|undefined) => {
    if(id){
        const graphData = await listVideoStats(id);
        console.log(graphData?.data.data);
        return graphData?.data.data;
    }
}

export const getChannelStats = async (id : string|undefined) => {
    if(id){
        const graphData = await listChannelStats(id);
        console.log("DATA :",graphData?.data.data);
        return graphData?.data.data;
    }
}
