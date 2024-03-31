const cache = require("memory-cache");
const express = require("express");
const app = express();
const port = 3000;

const testResponse = {
    TargetId: 16777914124,
    ProductType: "User Product",
    AssetId: 16777914124,
    ProductId: 1779697740,
    Name: "Gnarpy Tail",
    Description:
        "Boy, why you so gnarp gnarp?\n\n[ Modeled and textured by Fele_GB, uploaded by https://www.roblox.com/users/89525119/profile ]\n\nGnarpy is a NPC from the game Regretevator, play here: https://www.roblox.com/games/4972273297/Regretevator-ELEVATOR-SIMULATOR",
    AssetTypeId: 47,
    Creator: {
        Id: 1380766940,
        Name: "The Axolotl Sun",
        CreatorType: "Group",
        CreatorTargetId: 5399587,
        HasVerifiedBadge: false,
    },
    IconImageAssetId: 0,
    Created: "2024-03-17T14:42:50.517Z",
    Updated: "2024-03-18T23:34:39.99Z",
    PriceInRobux: 60,
    PriceInTickets: null,
    Sales: 0,
    IsNew: false,
    IsForSale: true,
    IsPublicDomain: false,
    IsLimited: false,
    IsLimitedUnique: false,
    Remaining: null,
    MinimumMembershipLevel: 0,
    ContentRatingTypeId: 0,
    SaleAvailabilityLocations: ["Catalog", "AllUniverses"],
    SaleLocation: null,
    CollectibleItemId: null,
    CollectibleProductId: null,
    CollectiblesItemDetails: null,
};

function robloxFetch(url) {
    return fetch(url, {
        headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "accept-encoding": "gzip, deflate, br",
            "Cache-Control": "no-cache",
            Cookie: "rbx-ip2=; RBXEventTrackerV2=CreateDate=3/31/2024 8:16:45 AM&rbxid=&browserid=222534248713; GuestData=UserID=-1926138975; RBXcb=RBXViralAcquisition=true&RBXSource=true&GoogleAnalytics=true; RBXSource=rbx_acquisition_time=3/31/2024 8:16:46 AM&rbx_acquisition_referrer=https://www.roblox.com/&rbx_medium=Social&rbx_source=www.roblox.com&rbx_campaign=&rbx_adgroup=&rbx_keyword=&rbx_matchtype=&rbx_send_info=1",
            Pragma: "no-cache",
            "Sec-ch-ua":
                '"Brave";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            "Sec-ch-ua-mobile": "?0",
            "Sec-Ch-Ua-Platform": "Linux",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Sec-Gpc": "1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent":
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            Referer: "https://www.roblox.com/",
        },
    }).then((res) => res.json());
}

app.get("/library/*", async (req, res) => {
    let id = req.params[0];
    let key = `__express__/library/${id}`;
    let cachedBody = cache.get(key);

    if (cachedBody && cachedBody.status === 200) {
        console.log("Serving from cache");
        res.send(cachedBody);
        return;
    }
    let response;
    if (testResponse) {
        response = testResponse;
    } else {
        response = await robloxFetch(
            `https://economy.roblox.com/v2/assets/${id}/details`
        );
    }
    let thumbnailJson = await robloxFetch(
        `https://thumbnails.roblox.com/v1/assets?assetIds=${id}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`
    );

    // Cache the response for 30 minutes if status is 200
    if (response.status === 200) {
        cache.put(key, response, 30 * 60 * 1000);
    }

    // Extract the image URL from the thumbnailJson response
    let imageUrl = thumbnailJson.data[0].imageUrl;
    let creator = response.Creator.Name;
    if (response.Creator.HasVerifiedBadge) {
        creator = creator + " ✅";
    }
    let price;
    if (response.PriceInRobux) {
        price = `R$${response.PriceInRobux}`;
    }
    let siteName;
    if (price) {
        siteName = `${price} | Uploaded by ${creator}`;
    } else {
        siteName = `Uploaded by ${creator}`;
    }
    let html = `<!DOCTYPE html>
<html>
  <head>
    <title>${response.Name}</title>
    <meta property="og:title" content="${response.Name}">
    <meta property="og:site_name" content="${siteName}">
    <meta property="og:description" content="${response.Description}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${imageUrl}">
    <meta http-equiv="Refresh" content="0; url='https://roblox.com/library/${id}'">
  </head>
  <body>
    <h1>Redirecting to <a href="https://roblox.com/library/${id}">${response.Name}</a>...</h1>
  </body>
</html>
`;

    res.send(html);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
