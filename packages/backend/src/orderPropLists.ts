// scripts/orderCardLists.ts

import {
  facePropType,
  orderCardProps,
  orderFaceProps,
  orderPartProps,
  partPropType,
  propType,
} from '@hellfall/shared/utils';

const listsToOrder = {};

if (Object.keys(listsToOrder).length) {
  console.log('// Ordered by propOrder\n');
  for (const [listName, props] of Object.entries(listsToOrder)) {
    orderCardProps(props as propType[]);
    console.log(`const ${listName} = ${JSON.stringify(props, null, 2).replaceAll('"', "'")};`);
    console.log();
  }
} else {
  console.log('// No card prop lists to order');
}

const faceListsToOrder = {};

if (Object.keys(faceListsToOrder).length) {
  console.log('// Ordered by facePropOrder\n');
  for (const [listName, props] of Object.entries(faceListsToOrder)) {
    orderFaceProps(props as facePropType[]);
    console.log(`const ${listName} = ${JSON.stringify(props, null, 2).replaceAll('"', "'")};`);
    console.log();
  }
} else {
  console.log('// No face prop lists to order');
}

const partListsToOrder = {};

if (Object.keys(partListsToOrder).length) {
  console.log('// Ordered by partPropOrder\n');
  for (const [listName, props] of Object.entries(partListsToOrder)) {
    orderPartProps(props as partPropType[]);
    console.log(`const ${listName} = ${JSON.stringify(props, null, 2).replaceAll('"', "'")};`);
    console.log();
  }
} else {
  console.log('// No part prop lists to order');
}
