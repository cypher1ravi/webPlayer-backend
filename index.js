const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');


const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors());

// Example route
app.get('/', (req, res) => {
    res.send('CORS is enabled for all origins!');
});

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16).toUpperCase();
    });
}

function generateCustomID() {
    function randomDigits(length) {
        let digits = '';
        for (let i = 0; i < length; i++) {
            digits += Math.floor(Math.random() * 10);  // Random digit between 0-9
        }
        return digits;
    }

    const part1 = randomDigits(13);  // 13 digits
    const part2 = randomDigits(12);  // 12 digits
    const part3 = randomDigits(6);   // 6 digits
    const part4 = randomDigits(3);   // 3 digits
    const part5 = randomDigits(6);   // 6 digits

    return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

function generateComplexID() {
    // Helper function to generate a random alphanumeric string of given length
    function randomAlphanumeric(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    }

    // Generate first part: 32 characters hex string
    const part1 = (Math.random().toString(16) + '0000000000000000').substring(2, 34);

    // Generate second part: alphanumeric string
    const part2 = randomAlphanumeric(25); // Adjust length as needed

    // Return the final ID format
    return `${part1}_${part2}`;
}

function generateRandomImpId() {
    const randomNumber = Math.floor(10000 + Math.random() * 9000);
    return `${'imp'}${randomNumber}`;
}

async function openRTB_2_5(vastTag, data) {

    try {
        const id = `${generateComplexID()}_${data?.adssourceId}`;
        const timeoutmax = data?.timeout ?? 5000;
        const auctiontype = data?.auctiontype ?? 2; // Auction Type: 1 for First Price Auction, 2 for Second Price Auction
        const test = data?.test ?? 1; // Indicates whether the request is a test. Values: 1 = test, 0 = live

        // source
        const firstParty = 0; // Indicates whether the request is first-party (1) or from a reseller (0).
        const tid = `t_${id}`; // Transaction ID (Unique ID for the request)

        // regs
        const gdpr = 0; // Signals whether the request is subject to the General Data Protection Regulation (GDPR). Values: 1 = GDPR applies, 0 = GDPR does not apply. Optional in OpenRTB.
        const coppa = 0; // Indicates whether the request complies with the Children’s Online Privacy Protection Act (COPPA). Values: 1 = COPPA applies, 0 = COPPA does not apply.
        const us_privacy = "1---"; // CCPA (US Privacy String)
        const tcf_version = 2; // Transparency & Consent Framework version

        // ext
        const gpid = `/${data?.publisherId}/${data?.playertagId}/${data?.domainname}`; // /organizationId/tagId/websitedomain
        const ssl = 1; // from HTTPS - 1, from HTTP - 0
        const ip = data?.ip // User IP Address

        // site
        const domain = data?.domainname ?? ""; // Domain of the website
        const page = data?.href ?? ""; // URL of the page where the ad will be displayed
        const publisherName = data?.domainname ?? ""; // Name of the publisher
        const publisherSiteId = data?.openpublisherid ?? "162175"; // From dashboard
        const ref = data?.domainurl ?? ""; // Referrer URL
        const siteId = data?.siteid ?? "1121005"; // From dashboard

        // user
        const userbuyerid = generateUUID(); // Unique ID of the user
        const userid = data?.userid; // Custom ID of the user

        // device
        const deviceMake = data?.manufacturer ?? "Google"; // Device Manufacturer (from which browser it is requested)
        const devicePpi = 45; // Pixels per inch of the device
        const devicePxratio = 1; // The ratio of physical pixels to device independent pixels.
        const deviceJs = 1; // Support for JavaScript, where 0 = no, 1 = yes
        const deviceConnectiontype = data?.connectiontype ?? 2; // Network Connection Type: 0 for Unknown, 1 for Ethernet, 2 for WIFI, 3 for Cellular Network – Unknown Generation, 4 for Cellular Network – 2G, 5 for Cellular Network – 3G, 6 for Cellular Network – 4G, 7 for Cellular Network – 5G
        const deviceDevicetype = data?.devicetype ?? 2; // Device Type: 1 for Mobile/Tablet, 2 for Desktop, 3 for Connected TV, 4 for Phone, 5 for Tablet, 6 for Connected Device, and 7 for Set-Top Box
        const deviceCarrier = data?.provider ?? "Airtel Broadband"; // Carrier or ISP
        const deviceW = data?.deviceWidth ?? 800; // Screen Width
        const deviceDNT = data?.dnt ?? 0; // Do Not Track
        const deviceModel = data?.model ?? "Chrome";
        const deviceOS = data?.os ?? "Linux";
        const deviceUserAgent = data?.useragent ?? "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36";
        const deviceH = data?.deviceHight ?? 600; // Screen Height
        const diviceLimit = 0; // Limit Ad Tracking signal commercially endorsed (e.g., iOS, Android), where 0 = tracking is unrestricted, 1 = tracking must be limited per commercial guidelines.
        const devicesLanguage = "en"; // Browser language
        const geo = {
            "city": data?.city ?? "Hyderabad",
            "zip": data?.zip ?? "500036",
            "ipservice": 3,
            "lat": data?.lat ?? 17.385,
            "lon": data?.lon ?? 78.4378,
            "country": data?.countryCode3 ?? "IND",
            "type": 2,
            "region": data?.region ?? "TS"
        }

        // Impression
        const bidfloor = data?.minCpm ?? 0.01;
        const impressionId = generateRandomImpId();
        const impressionTagId = data?.tagid ?? "5391078";
        const impressionInterstitial = data?.interstitial ?? 0; // Indicates if the impression is interstitial or not. Values: 1 = interstitial, 0 = not interstitial

        // Video
        const impressionStartdelay = 0;
        const impressionMaxduration = data?.maxduration ?? 500;
        const impressionMinduration = data?.minduration ?? 1;
        const impressionW = data?.playerWidth ?? 640;
        const impressionSkip = data?.skippable ?? 1;
        const impressionLinearity = 1;
        const impressionApi = data?.api ?? [2];
        const impressionBoxingallowed = 1;
        const impressiondelivery = [1, 2];
        const impressionmaxbitrate = data?.maxbitrate ?? 30000;
        const impressionMime = data?.mimetype ?? [
            "application/javascript",
            "applications/x-mpegU",
            "video/mp4",
            "video/ogg",
            "video/webm",
            "video/3gpp",
            "video/H264"
        ];
        const impressionprotocols = data?.protocols ?? [2, 3, 5, 6, 7, 8];
        const impressionmaxextended = 30;
        const impressionminbitrate = 200;
        const impressionH = data?.playerHeight ?? 360;
        const impressionplacement = data?.placement ?? 3;
        const impressionplcmt = data?.sound ? 1 : 2;
        const impressionPlayBackMethod = data?.playbackmethod ?? [6];

        const sampledata = {
            "at": auctiontype,
            "source": {
                "fd": firstParty,
                "tid": tid
            },
            "regs": {
                "gdpr": gdpr,
                "coppa": coppa,
                "ext": {
                    "us_privacy": us_privacy,
                    "tcf_version": tcf_version
                }
            },
            "ext": {
                "gpid": gpid,
                "ssl": ssl,
                "ip": ip
            },
            "site": {
                "domain": domain,
                "content": {
                    "genre": "",
                    "keywords": "",
                    "network": {},
                    "channel": {},
                    "context": 1,
                    "ext": {},
                    "title": "",
                    "episode": 0,
                    "url": "",
                    "series": "",
                    "season": ""
                },
                "page": page,
                "publisher": {
                    "name": publisherName,
                    "id": publisherSiteId,
                    "domain": domain
                },
                "name": domain,
                "ref": ref,
                "id": siteId,
                "ext": {}
            },
            "test": test,
            "user": {
                "buyerid": userbuyerid,
                "id": userid,
                "buyeruid": userbuyerid
            },
            "device": {
                "make": deviceMake,
                "ppi": devicePpi,
                "pxratio": devicePxratio,
                "js": deviceJs,
                "connectiontype": deviceConnectiontype,
                "devicetype": deviceDevicetype,
                "carrier": deviceCarrier,
                "w": deviceW,
                "dnt": deviceDNT,
                "ip": ip,
                "model": deviceModel,
                "os": deviceOS,
                "geo": geo,
                "ext": {},
                "language": devicesLanguage,
                "lmt": diviceLimit,
                "h": deviceH,
                "ua": deviceUserAgent
            },
            "cur": [
                "USD"
            ],
            "imp": [
                {
                    "instl": impressionInterstitial,
                    "secure": ssl,
                    "tagid": impressionTagId,
                    "video": {
                        "startdelay": impressionStartdelay,
                        "maxduration": impressionMaxduration,
                        "minduration": impressionMinduration,
                        "w": impressionW,
                        "skip": impressionSkip,
                        "linearity": impressionLinearity,
                        "api": impressionApi,
                        "boxingallowed": impressionBoxingallowed,
                        "delivery": impressiondelivery,
                        "ext": {
                            "video_skippable": impressionSkip
                        },
                        "maxbitrate": impressionmaxbitrate,
                        "mimes": impressionMime,
                        "protocols": impressionprotocols,
                        "pos": 1,
                        "maxextended": impressionmaxextended,
                        "minbitrate": impressionminbitrate,
                        "playbackmethod": impressionPlayBackMethod,
                        "h": impressionH,
                        "placement": impressionplacement,
                        "plcmt": impressionplcmt
                    },
                    "ext": {
                        "gpid": gpid
                    },
                    "bidfloor": bidfloor,
                    "id": impressionId,
                    "bidfloorcur": "USD"
                }
            ],
            "id": id,
            "tmax": timeoutmax
        };




        const vastResponse = await openRTB_Vast(sampledata, vastTag, data?.protocolversion);

        return vastResponse;
    } catch (error) {
        console.log(error);
        return {
            status: "no-ad",
            message: "An error occurred",
            vastResponse: null,
            display: false,
            price: null,
        };
    }
}

async function openRTB_Vast(sampledata, vastTag, version) {


    try {
        const data = await fetch(vastTag, {
            method: "POST", // Assuming it's a POST request; update if needed
            headers: {
                "Content-Type": "application/json",
                "Accept-Encoding": "gzip",
                "x-openrtb-version": version ?? "2.5",
            },
            body: JSON.stringify(sampledata), // Send `sampledata` as the request body
        });

        if (data?.status !== 200) {
            return {
                status: "no-ad",
                message: "No ad available",
                vastResponse: null,
                display: false,
                price: null,
            };
        }
        const response = await data.json();

        const vastString = response?.seatbid?.[0]?.bid?.[0]?.adm;
        const price = response?.seatbid?.[0]?.bid?.[0]?.price;

        return {
            status: "ad",
            message: "Ad available",
            vastResponse: vastString,
            display: true,
            price,
        };
    } catch (error) {
        console.log(error);
        return {
            status: "no-ad",
            message: "An error occurred",
            vastResponse: null,
            display: false,
            price: null,
        };
    }
}

app.post('/api/openrtb', async (req, res) => {


    try {
        const vastTag = req.body.vastTag;
        const data = req.body.data;


        if (!vastTag || !data) {
            return res.status(400).json({ error: "vastTag and data are required" });
        }

        const response = await openRTB_2_5(vastTag, data);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
