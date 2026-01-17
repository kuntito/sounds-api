import NodeID3 from "node-id3";
import { parseFile } from "music-metadata"
import neonDbClient from "./services/neonDbClient";

const fp = String.raw`C:\Users\owola\Documents\vs code\projects\Sounds\dummyData\Can't Breathe.mp3`;

// const fp = String.raw`C:\Users\owola\Documents\vs code\projects\Sounds\dummyData\Dealer.mp3`;

// TODO review using nodeID3 to modify the tags
// music metadata to read the tags 

const main = async () => {
    const metadata = await parseFile(fp);



    
    // console.log(metadata);
    // console.log('metadata.format =>', metadata.format);
    // console.log('metadata.common =>', metadata.common);  
    
    // const uuid = metadata.native["ID3v2.3"]?.find(tag => tag.id === "TXXX:uuid")?.value;
    // console.log(uuid);
    
}

main();

// NodeID3.update({
//     userDefinedText: [{
//         description: "uuid",
//         value: "001"
//     }]
// }, fp)

// const tags = NodeID3.read(fp);
// console.log(tags.title);
// console.log(tags.artist);