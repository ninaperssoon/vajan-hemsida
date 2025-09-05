export async function getSongData() {
    const url = "https://ninaperssoon.github.io/songbook/songs.json";
    try {
        const response = await fetch(
            url,
            {cache: "no-cache"});
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}