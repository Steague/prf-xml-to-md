const fetch = require("fetch").fetchUrl;
const parser = require("fast-xml-parser");
const _ = require("lodash");
const fs = require("fs");
const urlStatusCode = require("url-status-code");
const {
  prfTexturesPath,
  prfWikiPath,
  rwTexturesPath,
  rwWikiPath,
  itemDict
} = require("./variables");

const getResourceItem = (item, qty) => {
  const id = itemDict[item];
  if (!id || !id.src) {
    console.log("Need Item Info for ", item);
    return _.startCase(item);
  }
  let imgTag = `<img src="${id.src}" width="16" alt="${_.startCase(item)}" />`;
  if (id.link) {
    imgTag = `${imgTag}</td><td align="center">${qty}</td><td align="left"><a href="${
      id.link
    }">${_.startCase(item)}</a>`;
  }
  return imgTag;
};

const promiseFetch = url =>
  new Promise((resolve, reject) => {
    console.log("fetching XML");
    fetch(url, (error, meta, body) => {
      if (error) {
        return reject(error);
      }

      resolve({
        meta,
        body: body.toString()
      });
    });
  });

const getBasePowerConsumption = comps => {
  if (!comps) return 0;
  const { li } = comps;
  let bpc = 0;
  if (!li.forEach) {
    if (!li.basePowerConsumption) return 0;
    return li.basePowerConsumption;
  }
  li.forEach(c => {
    if (bpc === 0 && c.basePowerConsumption) {
      bpc = c.basePowerConsumption;
    }
  });
  return bpc;
};

const getBasePowerStorage = comps => {
  if (!comps) return 0;
  const { li } = comps;
  let bpc = 0;
  if (!li.forEach) {
    if (!li.storedEnergyMax) return 0;
    return li.storedEnergyMax;
  }
  li.forEach(c => {
    if (bpc === 0 && c.storedEnergyMax) {
      bpc = c.storedEnergyMax;
    }
  });
  return bpc;
};

const imgExists = url => {
  return new Promise(async (resolve, reject) => {
    try {
      const status = await urlStatusCode(url);
      resolve(status);
    } catch (error) {
      reject(error);
    }
  });
};

const getSkillLevelColumn = modExtensions => {
  let slH = "";
  let slD = "";
  let slC = "";
  if (!modExtensions) {
    return {
      slH,
      slD,
      slC
    };
  }

  const { li } = modExtensions;

  if (li.skillLevel || li.artSkillLevel) {
    slH = ` Skill Level |`;
    slD = " ----------- |";
  }

  if (li.skillLevel && li.artSkillLevel) {
    slC = ` <div align="center">${li.skillLevel} (Art: ${li.artSkillLevel})</div> |`;
  } else if (li.skillLevel) {
    slC = ` <div align="center">${li.skillLevel}</div> |`;
  } else if (li.artSkillLevel) {
    slC = ` <div align="center">Art: ${li.artSkillLevel}</div> |`;
  }

  return {
    slH,
    slD,
    slC
  };
};

const getPowerLevelColumn = (
  powerLabel,
  category,
  recipeMaker,
  bpc,
  inspectorTabs
) => {
  let pcH = "";
  let pcD = "";
  let pcC = "";
  if (category !== "Item" && !recipeMaker) {
    // Add the power column
    pcH = ` ${powerLabel} |`;
    pcD = " ------------- |";
    pcC = ` <div align="center">${bpc}W</div> |`;
  }

  if (inspectorTabs && inspectorTabs.li) {
    const { li } = inspectorTabs;

    if (
      _.findIndex(
        li,
        i => i === "ProjectRimFactory.Common.ITab_PowerSupply"
      ) !== -1
    ) {
      pcC = ` <div align="center">Based on machine settings.<br />(Variable)</div> |`;
    }
  }

  return {
    pcH,
    pcD,
    pcC
  };
};

const printMarkdownTable = async (
  {
    size: baseSize,
    statBases: baseStatBases,
    costList: baseCostList,
    comps: baseComps,
    researchPrerequisites: baseResearchPrerequisites
  },
  td
) => {
  let {
    label,
    graphicData,
    statBases,
    costList,
    description,
    size,
    uiIconPath,
    comps,
    researchPrerequisites,
    category,
    recipeMaker,
    modExtensions,
    inspectorTabs
  } = td;

  researchPrerequisites = researchPrerequisites
    ? researchPrerequisites
    : baseResearchPrerequisites;
  researchPrerequisites =
    typeof researchPrerequisites.li === "array"
      ? researchPrerequisites.li.map(i => _.startCase(i)).join("<br />")
      : _.startCase(researchPrerequisites.li);

  comps = comps ? comps : baseComps;
  let powerLabel = "Power";
  let bpc = getBasePowerConsumption(comps);
  let bps = getBasePowerStorage(comps);
  if (bps > 0) {
    bpc = bps;
    powerLabel = "Stores";
  }
  const graphicClass = graphicData.graphicClass;
  if (!size && graphicData.drawSize) size = graphicData.drawSize;
  if (!size && baseSize) size = baseSize;
  size = size ? size : graphicData.drawSize;
  size = size ? size : "(1,1)";
  size = size.substring(1, size.length - 1).split(",");
  if (uiIconPath) graphicData.texPath = uiIconPath;
  let texPath = `${graphicData.texPath}${
    graphicClass === "Graphic_Multi" ? "_north" : ""
  }`;
  statBases = { ...baseStatBases, ...statBases };
  costList = { ...baseCostList, ...costList };
  let imgSrc = `${prfTexturesPath}${texPath}.png?raw=true`;
  const iExists = await imgExists(imgSrc);
  if (iExists >= 400) {
    texPath = `${graphicData.texPath}`;
    imgSrc = `${prfTexturesPath}${texPath}.png?raw=true`;
  }
  const imgTag = `<img src="${imgSrc}" width="${size[0] *
    32}" height="${size[1] * 32}" />`;
  let fileData = `### ${_.replace(
    _.startCase(label),
    /([0-9]+)\s([K])\s(.*)/g,
    "$1$2 $3"
  )}\n`;
  // Add Power Consumption column
  let { pcH, pcD, pcC } = getPowerLevelColumn(
    powerLabel,
    category,
    recipeMaker,
    bpc,
    inspectorTabs
  );
  // Add the skill level column
  let { slH, slD, slC } = getSkillLevelColumn(modExtensions);
  fileData += `\n`;
  fileData += `|   | Size | Health |${pcH}${slH} Research Prerequisites | Resource Cost |\n`;
  fileData += `| - | ---- | ------ |${pcD}${slD} ---------------------- | ------------- |\n`;
  fileData += `| ${imgTag} | <div align="center">${size.join(
    "x"
  )}</div> | <div align="center">${
    statBases.MaxHitPoints
  }HP</div> |${pcC}${slC} ${researchPrerequisites} | <table frame="box" border="0" cellspacing="0" cellpadding="0"><tr><th>&nbsp;</th><th align="center">Qty</th><th align="left">Name</th></tr><tr>${_.map(
    costList,
    (qty, item) => `<td>${getResourceItem(item, qty)}</td>`
  ).join("</tr><tr>")}</tr></table> |\n`;
  fileData += `\n`;
  fileData += `${_.replace(description, /\\n/g, `<br />`)}\n`;
  fileData += `\n`;
  return fileData;
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const main = async () => {
  const myFetch = await promiseFetch(
    // "https://raw.githubusercontent.com/zymex22/Project-RimFactory-Revived/master/Defs/ThingDefs_Buildings/Buildings_Assemblers.xml"
    // "https://github.com/zymex22/Project-RimFactory-Revived/raw/master/Defs/ThingDefs_Buildings/Buildings_Miners.xml"
    // "https://raw.githubusercontent.com/zymex22/Project-RimFactory-Revived/master/Defs/ThingDefs_Buildings/Buildings_Storage.xml"
    // "https://raw.githubusercontent.com/zymex22/Project-RimFactory-Revived/master/Defs/ThingDefs_Buildings/Buildings_Industry.xml"
    // "https://raw.githubusercontent.com/zymex22/Project-RimFactory-Revived/master/Defs/ThingDefs_Buildings/Buildings_Cultivators.xml"
    // "https://raw.githubusercontent.com/zymex22/Project-RimFactory-Revived/master/Defs/ThingDefs_Buildings/Buildings_AnimalStations.xml"
    // "https://raw.githubusercontent.com/zymex22/Project-RimFactory-Revived/master/Defs/ThingDefs_Buildings/Buildings_Cooking.xml"
    // "https://raw.githubusercontent.com/zymex22/Project-RimFactory-Revived/master/Defs/ThingDefs_Buildings/Buildings_battery.xml"
    // "https://raw.githubusercontent.com/zymex22/Project-RimFactory-Revived/master/Defs/ThingDefs_Buildings/Buildings_Common.xml"
    // "https://github.com/zymex22/Project-RimFactory-Revived/raw/master/Defs/ThingDefs_Buildings/Buildings_Transport.xml"
    // "https://github.com/zymex22/Project-RimFactory-Revived/raw/master/Defs/ThingDefs_Buildings/Buildings_Misc.xml"
    // "https://github.com/zymex22/Project-RimFactory-Revived/raw/master/Defs/ThingDefs_Buildings/Lighting_FloorLamp.xml"
    // "https://github.com/zymex22/Project-RimFactory-Revived/raw/master/Defs/ThingDefs_Items/Things_Schematic.xml"
    "https://github.com/zymex22/Project-RimFactory-Revived/raw/master/Defs/ThingDefs_Items/Things_Common.xml"
  );
  let fileData = "";
  const { meta, body: xmlData } = myFetch;
  if (parser.validate(xmlData) !== true) {
    return;
  }
  const ThingDef = parser.parse(xmlData).Defs.ThingDef;
  let base = {
    statBases: {},
    size: "",
    costList: {},
    researchPrerequisites: {}
  };
  await asyncForEach(ThingDef, async (td, i) => {
    if (!td.label) {
      base.statBases = { ...base.statBases, ...td.statBases };
      base.size = td.size ? td.size : base.size;
      base.costList = { ...base.costList, ...td.costList };
      base.comps = { ...base.comps, ...td.comps };
      base.researchPrerequisites = {
        ...base.researchPrerequisites,
        ...td.researchPrerequisites
      };
    } else {
      fileData += await printMarkdownTable(base, td);
    }
  });
  fs.writeFile("output.md", fileData, () => {
    console.log("file written");
  });
};

main();
