// Function to download files
export const downloadFile = async (url: string, filename: string) => {
    console.log({"url": url});
    
    try {
        // Fetch the file data
        const response = await fetch(url);
        if (!response.ok) throw new Error("File download failed");

        // Convert the fetched data to a blob
        const blob = await response.blob();

        // Create a link element
        const link = document.createElement("a");
        
        // Create a URL for the blob and set as href
        const objectURL = URL.createObjectURL(blob);
        link.href = objectURL;
        
        // Set up the download attribute with the specified filename
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        
        // Clean up by revoking the object URL and removing the link
        URL.revokeObjectURL(objectURL);
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error downloading file:", error);
    }
};

// FUnction to download current analysis of a video in JSON
export const downloadJSONAnalysis = (currentAnalysis: object | undefined, video_title: string | undefined, channel_name: string | undefined): void => {
    const json = JSON.stringify(currentAnalysis, null);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${video_title}_${channel_name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
