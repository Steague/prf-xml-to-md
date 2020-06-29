const prfTexturesPath =
  "https://github.com/zymex22/Project-RimFactory-Revived/raw/master/Textures/";
const prfWikiPath =
  "https://github.com/zymex22/Project-RimFactory-Revived/wiki/";
const rwTexturesPath = "https://rimworldwiki.com/images/";
const rwWikiPath = "https://rimworldwiki.com/wiki/";

const itemDict = {
  PRFMachineFrame: {
    src: `${prfTexturesPath}Common/MachineFrame.png?raw=true`,
    link: `${prfWikiPath}/Construction-and-Crafting-Resources#machine-frame`
  },
  Steel: {
    src: `${prfTexturesPath}c/c9/Steel.png`,
    link: `${prfTexturesPath}Steel`
  },
  ComponentIndustrial: {
    src: `${prfTexturesPath}4/40/Component.png`,
    link: `${prfTexturesPath}Component`
  },
  RimFactory_Data_Disk: {
    src: `${prfTexturesPath}SAL3/datadisk.png?raw=true`,
    link: `${prfWikiPath}/Construction-and-Crafting-Resources#recipe-data-disk`
  },
  PRFRoboticArm: {
    src: `${prfTexturesPath}Common/RoboticArm.png?raw=true`,
    link: `${prfWikiPath}/Construction-and-Crafting-Resources#robotic-arm`
  },
  Plasteel: {
    src: `${prfTexturesPath}c/c5/Plasteel.png`,
    link: `${prfTexturesPath}Plasteel`
  },
  PRFWeakAIChip: {
    src: `${prfTexturesPath}Common/WeakAICore.png?raw=true`,
    link: `${prfWikiPath}/Construction-and-Crafting-Resources#weak-ai-chip`
  },
  PRFMachineFrameLarge: {
    src: `${prfTexturesPath}Common/MachineFrameLarge.png?raw=true`,
    link: `${prfWikiPath}/Construction-and-Crafting-Resources#adv-machine-frame`
  },
  PRFMachineFrameSmall: {
    src: `${prfTexturesPath}Common/MachineFrameSmall.png?raw=true`,
    link: `${prfWikiPath}/Construction-and-Crafting-Resources#simple-machine-frame`
  },
  WoodLog: {
    src: `${prfTexturesPath}d/df/Wood.png`,
    link: `${prfTexturesPath}Wood`
  },
  Gold: {
    src: `${prfTexturesPath}1/10/Gold.png`,
    link: `${prfTexturesPath}Gold`
  },
  Uranium: {
    src: `${prfTexturesPath}3/31/Uranium.png`,
    link: `${prfTexturesPath}Uranium`
  },
  Hay: {
    src: `${prfTexturesPath}a/aa/Hay.png`,
    link: `${prfTexturesPath}Hay`
  },
  PRFDroneModule: {
    src: `${prfTexturesPath}Common/DroneModule.png?raw=true`,
    link: `${prfWikiPath}/Construction-and-Crafting-Resources#drone-module`
  },
  AIPersonaCore: {
    src: `${prfTexturesPath}f/f2/AI_persona_core.png`,
    link: `${prfTexturesPath}AI_persona_core`
  }
};

module.exports = {
  prfTexturesPath,
  prfWikiPath,
  rwTexturesPath,
  rwWikiPath,
  itemDict
};
