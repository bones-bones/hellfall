import fs from 'fs';

// import { downloadImage } from "./downloadImage";
import { fetchTokens } from './fetchTokens';
import { fetchDatabase } from './fetchdatabase';
import { fetchUsernameMappings } from './fetchUsernameMapping';
import { HCRelatedCard } from '../../src/api-types/Card';
import { HCObject } from '../../src/api-types/Object';

const typeSet = new Set<string>();
const creatorSet = new Set<string>();
const tagSet = new Set<string>();

const main = async () => {
  const { data } = { data: await fetchDatabase() };
  const usernameMappings = await fetchUsernameMappings();

  const tokens = await fetchTokens();
  // const tokensWithBetterName = tokens.map(entry => {
  //   const {
  //     //@ts-ignore
  //     ['Name (number tokens with the same name, if only one token has that name still add a 1.)']:
  //       Name,
  //     ...rest
  //   } = entry;
  //   return { Name, ...rest };
  // });
  tokens.filter(e=>'all_parts' in e).forEach(token=>{
    const relatedToken:HCRelatedCard = {
      object: HCObject.ObjectType.RelatedCard,
      id:token.id,
      component:'token',
      name:token.name,
      type_line:token.type_line
    };
    token.all_parts?.forEach(tokenMaker=>{
      const relatedCard = data.find(card=>card.name == tokenMaker.name);
      if (relatedCard){
        tokenMaker.id = relatedCard.id;
        token.type_line = relatedCard.type_line;
        'all_parts' in relatedCard ? relatedCard.all_parts?.push(relatedToken) : relatedCard.all_parts = [relatedToken];
      }
    })
  })

  // const tokenMap = (tokensWithBetterName as TokenForImport[]).reduce<Record<string, Token[]>>(
  //   (current, entry) => {
  //     (entry['Related Cards (Read Comment)'] || '').split(';').forEach(cardEntry => {
  //       if (current[cardEntry.replace(/\*\d*$/, '')]) {
  //         current[cardEntry.replace(/\*\d*$/, '')].push({
  //           Name: entry.Name.replace(/(\d*)$/, ' $1'),
  //           Image: entry.Image,
  //           Power: entry.Power,
  //           Toughness: entry.Toughness,
  //           Type: entry.Type,
  //           // FIELD7: entry.FIELD7,
  //         });
  //       } else {
  //         current[cardEntry.replace(/\*\d*$/, '')] = [
  //           {
  //             Name: entry.Name.replace(/(\d*)$/, ' $1'),
  //             Image: entry.Image,
  //             Power: entry.Power,
  //             Toughness: entry.Toughness,
  //             Type: entry.Type,
  //             // FIELD7: entry.FIELD7,
  //           },
  //         ];
  //       }
  //     });
  //     return current;
  //   },
  //   {}
  // );

  data.forEach(entry => {
    [
      ...(entry.subtypes || []),
      ...(entry.types || []),
      ...(entry.subtypes || []),
    ].forEach(typeEntry => {      
      typeSet.add(typeEntry);
    });

    const usernameMappingEntries = Object.entries(usernameMappings);

    replaceLoop: for (const [replacementName, oldNames] of usernameMappingEntries) {
      for (const oldName of oldNames) {
        if (entry.creator.split(';').includes(oldName)) {
          entry.creator = entry.creator.replace(oldName, replacementName);
          break replaceLoop;
        }
      }
    }

    creatorSet.add(entry.creator);

    if ('tags' in entry) {
      entry.tags?.forEach(e => tagSet.add(e));
    }

    // if (entry.Constructed) {
    //   // @ts-expect-error not sure about this approach but hey.
    //   entry.Constructed = entry.Constructed.split(', ');
    // }

    // if (tokenMap[entry.Name]) {
    //   // Debug unused tokens
    //   // (tokenMap[entry.Name] as any).used = true;

    //   entry.tokens = tokenMap[entry.Name];

    //   // if (["HC8.0", "HC8.1"].includes(entry.Set)) {
    //   //   console.log(entry.Name);
    //   // }
    // }

    // if (
    //   entry["Text Box"]?.find((e) => e?.includes(" token")) &&
    //   !entry.tokens &&
    //   entry.Set === "HC6"
    // ) {
    //   console.log(
    //     entry.Name +
    //       "  " +
    //       /[^ ]+ [^ ]+ token/.exec(entry["Text Box"].join(","))![0],
    //   );
    // }
  });

  const types = Array.from(typeSet);
  const creators = Array.from(creatorSet);
  const tags = Array.from(tagSet);

  fs.writeFileSync(
    './src/data/types.json',
    JSON.stringify(
      {
        data: types.sort((a, b) => {
          if (a > b) {
            return 1;
          }
          return -1;
        }),
      },
      null,
      '\t'
    )
  );
  fs.writeFileSync(
    './src/data/tokens.json',
    JSON.stringify(
      {
        data: tokens.sort((a, b) => {
          if (a > b) {
            return -1;
          }
          return 1;
        }),
      },
      null,
      '\t'
    )
  );
  fs.writeFileSync(
    './src/data/tags.json',
    JSON.stringify(
      {
        data: tags.sort((a, b) => {
          if (a > b) {
            return 1;
          }
          return -1;
        }),
      },
      null,
      '\t'
    )
  );

  fs.writeFileSync(
    './src/data/creators.json',
    JSON.stringify(
      {
        data: creators.sort((a, b) => {
          if (a.toLowerCase() > b.toLowerCase()) {
            return 1;
          }
          return -1;
        }),
      },
      null,
      '\t'
    )
  );

  fs.writeFileSync(
    './src/data/Hellscube-Database.json',
    JSON.stringify(
      {
        data: data
          //@ts-ignore
          .concat({ data: tokens }),
      },
      null,
      '\t'
    )
  );
};

main();
