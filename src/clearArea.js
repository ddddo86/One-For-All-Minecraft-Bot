const process = require('process');
const fsp = require('fs').promises
const fs = require('fs');
const sd = require('silly-datetime');
const { Vec3 } = require('vec3')
const v = require('vec3');
const pTimeout = require('p-timeout');
const mcFallout = require(`../lib/mcFallout`);
const pathfinder = require(`../lib/pathfinder`);
const schematic = require(`../lib/schematic`);
const station = require('../lib/station');
const liquid = ['lava', 'water'];
const waterLoggedBlock = ['pointed_dripstone'];
const BLOCK_EXCLUDE_LIST = ["white_stained_glass", "budding_amethyst","iron_block","beacon","spawner","tinted_glass"]
let logger, mcData, bot_id, bot
let pause = false, stop = false;
let clearArea_cfg = {
    "updateTime": "",
    "area": {	//挖的目標區
        "server": 1,
        "p1": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "p2": {
            "x": 0,
            "y": 0,
            "z": 0
        }
    },
    "config": {	//挖的子區大小每次挖的單位
        "collect": false,
        "r_x": 8,
        "r_z": 8
    },
    "supportblock": "netherrack",
    "xpFarm": "yichen510",
    "materialsMode": "station",
    "station": "mpStation_Example.json",//材料站
}
const clearArea = {
    identifier: [
        "ca",
        "cleararea",
    ],
    cmd: [
        {
            name: "ca TEST",
            identifier: [
                "test",
            ],
            execute: clearArea_test,
            vaild: true,
            longRunning: true,
            permissionRequre: 0,
        },
        {
            name: "ca set",
            identifier: [
                "set",
            ],
            execute: clearArea_set,
            vaild: true,
            longRunning: false,
            permissionRequre: 0,
        },
        {//暫停
            name: "ca-暫停",
            identifier: [
                "pause",
                "p",
            ],
            execute: clearArea_pause,
            vaild: true,
            longRunning: false,
            permissionRequre: 0,
        },
        {//繼續"
            name: "ca-繼續",
            identifier: [
                "resume",
                "r",
            ],
            execute: clearArea_resume,
            vaild: true,
            longRunning: false,
            permissionRequre: 0,
        },
        {//中止
            name: "ca-中止",
            identifier: [
                "stop",
                "s",
                "c",
            ],
            execute: clearArea_stop,
            vaild: true,
            longRunning: false,
            permissionRequre: 0,
        },
        {//執行
            name: "ca-execute",
            identifier: [
                "execute",
                "e",
            ],
            execute: clearArea_execute,
            vaild: true,
            longRunning: true,
            permissionRequre: 0,
        },
        {//查詢
            name: "CA-查詢設定",
            identifier: [
                "info",
                "i",
            ],
            execute: clearArea_info,
            vaild: true,
            longRunning: false,
            permissionRequre: 0,
        },
    ],
    async init(bott, user_id, lg) {
        logger = lg
        bot_id = user_id;
        bot = bott
        mcData = require('minecraft-data')(bot.version)
        //clearArea.json
        if (!fs.existsSync(`${process.cwd()}/config/${bot_id}/clearArea.json`)) {
            logger(true, 'INFO', process.argv[2], `Creating config - clearArea.json`)
            save(clearArea_cfg)
        } else {
            clearArea_cfg = await readConfig(`${process.cwd()}/config/${bot_id}/clearArea.json`)
        }
    },
    async execute(task){
        await clearArea_execute(task);
    },
    async _setPos(pos1,pos2,s){
        let clearArea_set_cache = await readConfig(`${process.cwd()}/config/${bot_id}/clearArea.json`);
        clearArea_set_cache["updateTime"] = sd.format(new Date(), 'YYYY-MM-DD HH-mm-ss')
        clearArea_set_cache["area"]["p1"]["x"] = pos1.x
        clearArea_set_cache["area"]["p1"]["y"] = pos1.y
        clearArea_set_cache["area"]["p1"]["z"] = pos1.z
        clearArea_set_cache["area"]["p2"]["x"] = pos2.x
        clearArea_set_cache["area"]["p2"]["y"] = pos2.y
        clearArea_set_cache["area"]["p2"]["z"] = pos2.z
        clearArea_set_cache["area"]["server"] = s
        await fsp.writeFile(`${process.cwd()}/config/${bot_id}/clearArea.json`, JSON.stringify(clearArea_set_cache, null, '\t'));
    }
}
async function test(task) {
    await notImplemented()
}
async function clearArea_test(task) {
    console.log(bot.inventory.slots[45]?.name)
    //console.log(typeof bot)
}
async function clearArea_set(task) {
    // 兩種 1. 設定當前座標 2. 六個值 + 分流
    let clearArea_set_cache = await readConfig(`${process.cwd()}/config/${bot_id}/clearArea.json`);
    clearArea_set_cache["updateTime"] = sd.format(new Date(), 'YYYY-MM-DD HH-mm-ss')
    if (task.content[2] == "p1" || task.content[2] == "p2") {
        if (task.content.length == 6) {
            if (Number.isInteger(parseInt(task.content[3])) && Number.isInteger(parseInt(task.content[4])) && Number.isInteger(parseInt(task.content[5]))) {
                clearArea_set_cache["area"][task.content[2]]["x"] = parseInt(task.content[3]);
                clearArea_set_cache["area"][task.content[2]]["y"] = parseInt(task.content[4]);
                clearArea_set_cache["area"][task.content[2]]["z"] = parseInt(task.content[5]);
            } else {
                await taskreply(task,
                    `&7[&bCA&7] &c設置失敗 &7${task.content[2]} 座標錯誤 &a${task.content[3]} ${task.content[4]} ${task.content[5]}`,
                    `[CA]設置失敗: ${task.content[2]} 座標錯誤 ${task.content[3]} ${task.content[4]} ${task.content[5]}`,
                    null,
                );
                return
            }
        } else {		// 以bot當前座標
            clearArea_set_cache["area"][task.content[2]]["x"] = Math.round(bot.entity.position.x - 0.5)
            clearArea_set_cache["area"][task.content[2]]["y"] = Math.round(bot.entity.position.y)
            clearArea_set_cache["area"][task.content[2]]["z"] = Math.round(bot.entity.position.z - 0.5)
        }
    } else if (task.content.length >= 8) {
        // 六參
        if (Number.isInteger(parseInt(task.content[2])) && Number.isInteger(parseInt(task.content[3])) && Number.isInteger(parseInt(task.content[4]))) {
            clearArea_set_cache["area"]["p1"]["x"] = parseInt(task.content[2]);
            clearArea_set_cache["area"]["p1"]["y"] = parseInt(task.content[3]);
            clearArea_set_cache["area"]["p1"]["z"] = parseInt(task.content[4]);
        } else {
            //bot.chat(`/m ${playerid} &7[&bCA&7] &c設置失敗: &7 p1座標錯誤 ${task.content[2]} ${task.content[3]} ${task.content[4]}`); 
            return
        }
        if (Number.isInteger(parseInt(task.content[5])) && Number.isInteger(parseInt(task.content[6])) && Number.isInteger(parseInt(task.content[7]))) {
            clearArea_set_cache["area"]["p2"]["x"] = parseInt(task.content[5]);
            clearArea_set_cache["area"]["p2"]["y"] = parseInt(task.content[6]);
            clearArea_set_cache["area"]["p2"]["z"] = parseInt(task.content[7]);
        } else {
            //bot.chat(`/m ${playerid} &7[&bCA&7] &c設置失敗: &7 p2座標錯誤 ${task.content[5]} ${task.content[6]} ${task.content[7]}`); 
            return
        }
        if (task.content[8] != undefined && Number.isInteger(parseInt(task.content[8]))) {
            clearArea_set_cache["area"]["server"] = parseInt(task.content[8]);
        } else {
            clearArea_set_cache["area"]["server"] = bot.botinfo.server
        }
    } else {
        // error 
        await taskreply(task,
            `&7[&bCA&7] &c設置失敗 參數數量錯誤`,
            `[CA]設置失敗: 參數數量錯誤`,
            null,
        );
        return;
    }
    await fsp.writeFile(`${process.cwd()}/config/${bot_id}/clearArea.json`, JSON.stringify(clearArea_set_cache, null, '\t'));
    await taskreply(task,
        `&7[&bCA&7]  &a設置成功`,
        `[CA]設置失敗: 設置成功`,
        null,
    );
    return;
}
async function clearArea_pause(task) {
    pause = true;
}
async function clearArea_resume(task) {
    pause = false;
}
async function clearArea_stop(task) {
    stop = true;
}
async function clearArea_info(task) {
    let clearArea_set_cache = await readConfig(`${process.cwd()}/config/${bot_id}/clearArea.json`);
    // let lppq = await litematicPrinter.progress_query(task, bot)
    // //console.log(lppq)
    // let prog = ((lppq.placedBlock / lppq.totalBlocks) * 100).toFixed(1)
    switch (task.source) {
        case 'minecraft-dm':
            bot.chat(`/m ${task.minecraftUser} &7[&bCA&7] &bp1 &7${clearArea_set_cache["area"]["p1"]["x"]} &7${clearArea_set_cache["area"]["p1"]["y"]} &7${clearArea_set_cache["area"]["p1"]["z"]}`);
            bot.chat(`/m ${task.minecraftUser} &7[&bCA&7] &bp2 &7${clearArea_set_cache["area"]["p2"]["x"]} &7${clearArea_set_cache["area"]["p2"]["y"]} &7${clearArea_set_cache["area"]["p2"]["z"]}`);
            //bot.chat(`/m ${task.minecraftUser} ${1} ${prog}%`);
            break;
        case 'console':
            console.log(`[CA] p1 ${clearArea_set_cache["area"]["p1"]["x"]} ${clearArea_set_cache["area"]["p1"]["y"]} ${clearArea_set_cache["area"]["p1"]["z"]}`)
            console.log(`[CA] p2 ${clearArea_set_cache["area"]["p2"]["x"]} ${clearArea_set_cache["area"]["p2"]["y"]} ${clearArea_set_cache["area"]["p2"]["z"]}`)
            break;
        case 'discord':
            console.log(`Discord Reply not implemented ${discord_msg}`);
            break;
        default:
            break;
    }
}
async function clearArea_execute(task) {
    const mcData = require('minecraft-data')(bot.version)
    Item = require('prismarine-item')(bot.version)
    let clearArea_settings = await readConfig(`${process.cwd()}/config/${bot_id}/clearArea.json`);
    let debugMode = bot.debugMode
    let stationConfig
    if (clearArea_settings.materialsMode == 'station') {
        bot.logger(true, "INFO",process.argv[2], `加載材料站資訊...`)
        try {
            stationConfig = await readConfig(`${process.cwd()}/config/global/${clearArea_settings.station}`);
        } catch (e) {
            bot.logger(true, "ERROR",process.argv[2], `材料站設定檔讀取失敗\nFilePath: ${process.cwd()}/config/global/${clearArea_settings.station}`)
            await sleep(1000)
            console.log("Please Check The Json Format")
            console.log(`Error Msg: \x1b[31m${e.message}\x1b[0m`)
            console.log("You can visit following websites the fix: ")
            console.log(`\x1b[33mhttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/JSON_bad_parse\x1b[0m`)
            console.log(`\x1b[33mhttps://www.google.com/search?q=${(e.message).replaceAll(" ", "+")}\x1b[0m`)
            bot.gkill(202)
        }
        bot.logger(true, "INFO",process.argv[2], `材料站 ${stationConfig.stationName} 加載成功`)
    }
    stop = false, pause = false
    try {
        let collect = clearArea_settings.config.collect;
        let areaServer = clearArea_settings.area.server
        areaServer = (areaServer == -1) ? bot.botinfo.server : areaServer;
        let p1 = v(clearArea_settings.area.p1), p2 = v(clearArea_settings.area.p2);
        if (p1.x > p2.x) [p1.x, p2.x] = [p2.x, p1.x]
        if (p2.y > p1.y) [p1.y, p2.y] = [p2.y, p1.y]
        if (p1.z > p2.z) [p1.z, p2.z] = [p2.z, p1.z]
        let areaSize = p2.clone().minus(p1).offset(1, 0, 1);
        let child = {   //分單元挖
            x: clearArea_settings.config.r_x,
            y: Math.abs(areaSize.y) + 1,
            z: clearArea_settings.config.r_z,
            x_size: Math.ceil(areaSize.x / clearArea_settings.config.r_x),
            z_size: Math.ceil(areaSize.z / clearArea_settings.config.r_z),
        }
        console.log(child)
        child.length = child.x_size * child.z_size;
        child.status = Array(child.length).fill(0)
        console.log(child.length, child.status)
        let blank_child_area = Array((child.x) * (child.z) * child.y).fill(0);
        let supportblock = bot.inventory.findInventoryItem(mcData.itemsByName.netherite_pickaxe.id, null, false); // ???這行有問題
        await bot.equip(supportblock, "hand")
        // -z to z
        // -x to x
        for (let currentChild = 0; currentChild < child.length && !stop; currentChild++) {
            let crtc_x_index = parseInt(currentChild / child.z_size);
            let crtc_z_index = currentChild % child.z_size;
            let currentChildPos = p1.clone().offset(child.x * crtc_x_index, 0, child.z * crtc_z_index);
            //console.log(`crt c index ${crtc_x_index} ${crtc_z_index}`)
            let crtBlockState = blank_child_area.slice(0);
            let crtBlockDigCD = [];			//use index
            let crtBlockPlaceCD = [];		//use index
            let crtBlockPlaceVec = []
            let crtLastIndex = 0;
            bot.on('blockUpdate', lggtest)
            try {
                ca_e: while (!stop) {
                    if (stop) return
                    if (pause) {
                        await sleep(500);
                        continue;
                    }
                    bot.entity.onGround = true;
                    let nowpos = new Vec3(Math.round(bot.entity.position.x - 0.5), Math.round(bot.entity.position.y), Math.round(bot.entity.position.z - 0.5));
                    let crtServer = bot.botinfo.server;
                    //#實驗 #EXP 分流&座標 檢測 矯正
                    if (crtServer > 0 && crtServer != areaServer) {
                        console.log(`分流錯誤 當前:${crtServer} 預期:${areaServer}`)
                        while (true) {
                            //await sleep(100)
                            if (bot.botinfo.server == areaServer) break;
                            console.log(`嘗試切換分流 ${crtServer} -> ${areaServer}`)
                            bot.chat(`/ts ${areaServer}`);
                            let checkChangeServer = await mcFallout.waitChangeServer(bot, 15000);
                            if (checkChangeServer == 1) break;
                            console.log(`切換失敗`);
                        }
                        console.log("分流矯正完成");
                    }
                    if (!pos_in_box(nowpos, p1.offset(-1, 180, -1), p2.offset(1, -180, 1))) {

                        console.log("座標不再投影內"); await sleep(5000);
                        console.log(`當前座標 ${nowpos}`)
                        console.log(p1)
                        console.log(p2)
                        bot.chat(`/homes ca`);
                        await sleep(2000);
                        console.log("座標矯正完成");
                    }
                    let crtSelectIndex = -1, canSetLast = true;
                    for (let ii = crtLastIndex; crtSelectIndex == -1 && ii < crtBlockState.length; ii++) {
                        if (crtBlockState[ii] == -1) {
                            if (canSetLast) crtLastIndex = ii + 1;
                            continue;
                        } else {
                            if (crtBlockDigCD.indexOf(ii) >= 0 || crtBlockPlaceCD.indexOf(ii) >= 0) {
                                canSetLast = false;
                                continue;
                            } else {
                                crtSelectIndex = ii;
                                //console.log(`find Tg ${ii}`)
                                break;
                            }
                        }
                    }
                    if ((canSetLast == true) && (crtSelectIndex == -1)) {
                        //console.log(crtLastIndex)
                        //let ccc = crtLastIndex.filter(x => x==-1).length
                        // if(ccc/crtLastIndex.length==1){

                        // }
                        // let ccc = crtLastIndex.filter(x => x==-1).length
                        // if(ccc/crtLastIndex.length==1){
                        // }
                        //console.log(`本階已完成 ${crtc_x_index} ${crtc_z_index}`)

                        break;
                    }
                    else if ((canSetLast == false) && (crtSelectIndex == -1)) {
                        await sleep(50);
                        continue ca_e;
                    }
                    let crtSelRelativeCoordinates = getPosition(crtSelectIndex, child)	//相對座標
                    let crtSeRealCoordinates = currentChildPos.plus(crtSelRelativeCoordinates)
                    if (!pos_in_box(crtSeRealCoordinates, p1, p2)) {
                        crtBlockState[crtSelectIndex] = -1;
                        continue ca_e;
                    }
                    if (bot.blockAt(crtSeRealCoordinates) == null) {
                        await sleep(50);
                        await pathfinder.astarfly(bot, crtSeRealCoordinates.offset(0, 1, 0), null, null, null, !debugMode);
                    }
                    //console.log(crtSeRealCoordinates, crtBlockState[crtSelectIndex])
                    if (crtBlockState[crtSelectIndex] == 0) {   //為識別
                        let vvv = [v(0, 0, 0), v(1, 0, 0), v(-1, 0, 0), v(0, -1, 0), v(0, 0, 1), v(0, 0, -1)]
                        for (let v_index = 0; v_index < vvv.length; v_index++) {
                            let crtcheckLavaBlock = bot.blockAt(crtSeRealCoordinates.plus(vvv[v_index]));
                            if (crtcheckLavaBlock == null) {
                                await sleep(50);
                                await pathfinder.astarfly(bot, crtSeRealCoordinates.plus(vvv[v_index]), null, null, null, !debugMode);
                                continue ca_e;
                            }
                            if (BLOCK_EXCLUDE_LIST.indexOf(crtcheckLavaBlock.name) >= 0&& v_index == 0) { //bug 周圍有就被跳過
                                crtBlockState[crtSelectIndex] = -1;
                                continue ca_e;
                            }
                            if (liquid.indexOf(crtcheckLavaBlock.name) >= 0) {
                                // console.log(crtSeRealCoordinates.plus(vvv[v_index]))
                                // console.log(v_index)
                                // console.log("mark lava")
                                crtBlockState[crtSelectIndex] = 2;
                                //console.log("初次判斷類別",crtcheckLavaBlock.name,crtBlockState[crtSelectIndex])
                                continue ca_e;
                            }
                            if (waterLoggedBlock.indexOf(crtcheckLavaBlock.name) >= 0) {
                                if (crtcheckLavaBlock._properties?.waterlogged) {
                                    crtBlockState[crtSelectIndex] = 2;
                                    //console.log("初次判斷類別",crtcheckLavaBlock.name,crtBlockState[crtSelectIndex])
                                    continue ca_e;
                                }
                            }
                        }
                        crtBlockState[crtSelectIndex] = 1;
                    } else if (crtBlockState[crtSelectIndex] == 1) {    //可以直接挖掘
                        //let supportblock = bot.inventory.findInventoryItem(mcData.itemsByName.netherite_pickaxe.id, null, false);
                        //await bot.equip(supportblock, "hand")
                        let targetBlock = bot.blockAt(crtSeRealCoordinates);
                        if (targetBlock == null) continue ca_e;
                        //console.log(targetBlock)
                        let needTool = targetBlock.material//最佳材料
                        //console.log(needTool)
                        if (needTool == 'default') {

                        } else {
                            let chosetool, allTool
                            try {
                                let toolAllmumber = needTool.toString().split('/');
                                chosetool = toolAllmumber[1]
                                if (chosetool == undefined) chosetool = "pickaxe"
                                allTool = "netherite_" + chosetool
                                let bestTool = bot.inventory.findInventoryItem(mcData.itemsByName[allTool].id, null, false)
                                await bot.equip(bestTool, "hand")
                            } catch (e) {
                                // console.log(needTool)
                                // console.log(chosetool)
                                // console.log(allTool)
                            }
                        }
                        if (targetBlock == null) {
                            //await sleep(50);
                            await pathfinder.astarfly(bot, crtSeRealCoordinates.offset(0, 1, 0), null, null, null, !debugMode);
                        } else if (targetBlock.name == "air" || targetBlock.name == "cave_air" || targetBlock.name == "void_air") {
                            crtBlockState[crtSelectIndex] = -1;
                        } else if(BLOCK_EXCLUDE_LIST.indexOf(targetBlock.name) >= 0){
                            crtBlockState[crtSelectIndex] = -1;
                        }else {
                            //挖掘here
                            if (bot.heldItem?.nbt?.value?.Damage?.value > 1000) {
                                bot.chat('/sethome ca')
                                console.log('fix tool')
                                await mcFallout.warp(bot, clearArea_settings["xpFarm"])
                                await sleep(20000)
                                bot.chat('/back')
                                await sleep(5000)
                            }
                            bot._client.write("abilities", {
                                flags: 15,
                                flyingSpeed: 4.0,
                                walkingSpeed: 4.0
                            })
                            await pathfinder.astarfly(bot, crtSeRealCoordinates.offset(0, 1, 0), null, null, null, !debugMode);
                            bot.entity.onGround = true;
                            bot._client.write('block_dig', {
                                status: 0,
                                location: targetBlock.position,
                                face: 1
                            })
                            let dd = bot.digTime(targetBlock)
                            targetBlock = bot.blockAt(crtSeRealCoordinates);
                            let type = null
                            let enchantments = []

                            // Retrieve currently held item ID and active enchantments from heldItem
                            const currentlyHeldItem = bot.heldItem
                            if (currentlyHeldItem) {
                                type = currentlyHeldItem.type
                                enchantments = currentlyHeldItem.enchants
                            }
                            const headEquipmentSlot = bot.getEquipmentDestSlot('head')
                            const headEquippedItem = bot.inventory.slots[headEquipmentSlot]
                            if (headEquippedItem) {
                                const helmetEnchantments = headEquippedItem.enchants
                                enchantments = enchantments.concat(helmetEnchantments)
                            }

                            const creative = bot.game.gameMode === 'creative'
                            if (targetBlock == null) continue ca_e;
                            dd = targetBlock.digTime(type, creative, bot.entity.isInWater, true, enchantments, bot.entity.effects)
                            // if (dd >= 100) {
                            //     console.log(dd, targetBlock.name,type, creative, bot.entity.isInWater, true, enchantments, bot.entity.effects)
                            // }
                            if (dd > 10000) {
                                dd = 10000;
                            }
                            if(dd<=350){
                                dd = 50
                            }else{
                                dd/=2
                            }
                            if(targetBlock.name == "cobweb") dd = 2_000
                            //console.log(targetBlock)
                            await sleep(dd)
                            bot._client.write('block_dig', {
                                status: 2,
                                location: targetBlock.position,
                                face: 1
                            })
                            crtBlockDigCD.push(crtSelectIndex);
                            setTimeout(function () {
                                crtBlockDigCD.shift();
                            }, 2000)
                            // #debug
                            //crtBlockState[crtSelectIndex]=-1;
                            // #debug
                        }
                    } else if (crtBlockState[crtSelectIndex] == 2) {
                        await pathfinder.astarfly(bot, crtSeRealCoordinates.offset(0, 1, 0), null, null, null, !debugMode);
                        let vvv = [v(0, 0, 0), v(1, 0, 0), v(-1, 0, 0), v(0, -1, 0), v(0, 0, 1), v(0, 0, -1)]
                        let good = 0;
                        for (let v_index = 0; v_index < vvv.length; v_index++) {
                            let crtRplacePos = crtSeRealCoordinates.plus(vvv[v_index])
                            //console.log(crtRplacePos)
                            if (bot.blockAt(crtRplacePos) == null) continue ca_e;
                            if (crtBlockPlaceVec.indexOf(crtRplacePos) >= 0) {
                                continue;
                            }
                            if (liquid.indexOf(bot.blockAt(crtRplacePos).name) >= 0) {
                                if (bot.inventory.slots[45]?.name == clearArea_settings["supportblock"]) {
                                    bot.logger(false, "DEBUG", process.argv[2], `放置 supportblock`)
                                    const packet = {
                                        location: crtRplacePos,
                                        direction: 0,
                                        heldItem: Item.toNotch(bot.inventory.slots[45]),
                                        hand: 1,
                                        cursorX: 0.5,
                                        cursorY: 0.5,
                                        cursorZ: 0.5
                                    }
                                    //console.table(packet)
                                    bot._client.write('block_place', packet);
                                    crtBlockPlaceVec.push(crtRplacePos);
                                    setTimeout(function () {
                                        crtBlockPlaceVec.shift();
                                    }, 1000)
                                } else {
                                    let clearlavatool = bot.inventory.findInventoryItem(mcData.itemsByName[clearArea_settings["supportblock"]].id, null, false);
                                    if (clearlavatool) await bot.equip(clearlavatool, "off-hand")
                                    else {
                                        needReStock = [];
                                        needReStock.push({ name: clearArea_settings["supportblock"], count: 64, p: 64 })
                                        await mcFallout.promiseTeleportServer(bot, stationConfig.stationServer, 15_000)
                                        await sleep(2000)
                                        await station.restock(bot, stationConfig, needReStock)
                                        await mcFallout.promiseTeleportServer(bot, areaServer, 15_000)
                                        await sleep(5000)
                                    }

                                }
                            } else if (waterLoggedBlock.indexOf(bot.blockAt(crtRplacePos).name) >= 0) {
                                console.log("處理waterlog", crtSeRealCoordinates)
                                let targetBlock = bot.blockAt(crtSeRealCoordinates);
                                if (targetBlock == null) continue ca_e;
                                //console.log(targetBlock)
                                let needTool = targetBlock.material//最佳材料
                                //console.log(needTool)
                                if (needTool == 'default') {

                                } else {
                                    let chosetool, allTool
                                    try {
                                        let toolAllmumber = needTool.toString().split('/');
                                        chosetool = toolAllmumber[1]
                                        if (chosetool == undefined) chosetool = "pickaxe"
                                        allTool = "netherite_" + chosetool
                                        if (targetBlock == "cobweb") allTool = "shears"
                                      let bestTool = bot.inventory.findInventoryItem(mcData.itemsByName[allTool].id, null, false)
                                        await bot.equip(bestTool, "hand")
                                    } catch (e) {
                                        // console.log(needTool)
                                        // console.log(chosetool)
                                        // console.log(allTool)
                                    }
                                }
                                if (targetBlock == null) {
                                    //await sleep(50);
                                    await pathfinder.astarfly(bot, crtSeRealCoordinates.offset(0, 1, 0), null, null, null, !debugMode);
                                } else if (liquid.indexOf(targetBlock.name) >= 0) {
                                    crtBlockState[crtSelectIndex] = 2;
                                } else {
                                    await pathfinder.astarfly(bot, crtSeRealCoordinates.offset(0, 1, 0), null, null, null, !debugMode);
                                    bot._client.write('block_dig', {
                                        status: 0,
                                        location: targetBlock.position,
                                        face: 1
                                    })
                                    let dd = bot.digTime(targetBlock)
                                    targetBlock = bot.blockAt(crtSeRealCoordinates);
                                    let type = null
                                    let enchantments = []

                                    // Retrieve currently held item ID and active enchantments from heldItem
                                    const currentlyHeldItem = bot.heldItem
                                    if (currentlyHeldItem) {
                                        type = currentlyHeldItem.type
                                        enchantments = currentlyHeldItem.enchants
                                    }
                                    const headEquipmentSlot = bot.getEquipmentDestSlot('head')
                                    const headEquippedItem = bot.inventory.slots[headEquipmentSlot]
                                    if (headEquippedItem) {
                                        const helmetEnchantments = headEquippedItem.enchants
                                        enchantments = enchantments.concat(helmetEnchantments)
                                    }

                                    const creative = bot.game.gameMode === 'creative'
                                    if (targetBlock == null) continue ca_e;
                                    dd = targetBlock.digTime(type, creative, bot.entity.isInWater, true, enchantments, bot.entity.effects)
                                    dd = 50
                                    await sleep(dd)
                                    bot._client.write('block_dig', {
                                        status: 2,
                                        location: targetBlock.position,
                                        face: 1
                                    })
                                    crtBlockDigCD.push(crtSelectIndex);
                                    setTimeout(function () {
                                        crtBlockDigCD.shift();
                                    }, 2000)
                                }
                            } else good++;
                        }
                        // #debug
                        //good =5;
                        // #debug
                        if (good == 6) {
                            crtBlockState[crtSelectIndex] = 1;
                            continue ca_e;
                        }
                        crtBlockPlaceCD.push(crtSelectIndex);
                        setTimeout(function () {
                            crtBlockPlaceCD.shift();
                        }, 1000)
                    } else {
                        throw new Error(`wtf! got state ${crtBlockState[crtSelectIndex]}`);
                    }
                    /*		here old bad func for test only
                    for(let ii=0;ii<crtBlockState.length;ii++){
                        let targetVec = getPosition(ii,child)
                        let targetRealVec = currentChildPos.plus(targetVec)
                        targetBlock = bot.blockAt(targetRealVec)
                        if(targetBlock==null){
                            await pathfinder.astarfly(bot,targetRealVec.offset(0,1,0),null,null,null,!debugMode);
                        }else if(targetBlock.name=="air"||targetBlock.name=="cave_air"){
                            continue;
                        }
                        if (bot.heldItem.nbt.value.Damage.value > 1000) {
                            console.log('fix tool')
                            bot.chat('/warp yichen510')
                            await sleep(20000)
                            bot.chat('/back')
                            await sleep(5000)
                        }
                        await pathfinder.astarfly(bot,targetRealVec.offset(0,1,0),null,null,null,!debugMode);
                        bot._client.write('block_dig', {
                            status: 0,
                            location: targetBlock.position,
                            face: 1
                        })
                        await sleep(50)
                        bot._client.write('block_dig', {
                            status: 2,
                            location: targetBlock.position,
                            face: 1
                        })
                    }
                    */
                    //console.log(crtBlockState.length)
                    //break;
                }
                child.status[currentChild] = 1;
                let csc = child.status.filter(x => x == 1).length;
                console.log(`本階已完成 ${crtc_x_index} ${crtc_z_index} ${parseInt(1000 * csc / child.status.length) / 10}%`)
            } catch (e) {
                console.log(e)
                //bot.chat(`/m ${playerid} &7[&bCA&7] &c子區執行錯誤 已跳過`)
                child.status[currentChild] = -1;
                await sleep(1000);
            } finally {
                bot.off('blockUpdate', lggtest)
            }
            //console.log(crtBlockState)
            function lggtest(ob, nb) {
                if (!pos_in_box(nb.position, p1, p2)) return;
                let id = getIndex(ob.position.minus(currentChildPos), child)
                if (crtBlockState[id] == -1) return
                if (crtBlockState[id] == 1) {
                    if (nb.name == "air") crtBlockState[id] = -1;
                    //console.log("setbylistener")
                }
                //console.log(id,nb.position,ob.name,nb.name)
            }

        }
        await taskreply(task,
            `&7[&bCA&7] &aTask Complete`,
            `[CA] Task Complete`,
            null,
        );
    } catch (e) {
        console.log(e)
        await taskreply(task,
            `&7[&bCA&7] &c執行錯誤 已終止`,
            `&7[&bCA&7] &c執行錯誤 已終止`,
            null,
        );
    }
}
async function save(caec) {
    await fsp.writeFile(`${process.cwd()}/config/${bot_id}/clearArea.json`, JSON.stringify(caec, null, '\t'), function (err, result) {
        if (err) console.log('clearArea save error', err);
    });
    //console.log('task complete')
}
async function save_cache(mp_cache) {
    await fsp.writeFile(`${process.cwd()}/config/${bot_id}/clearArea_cache.json`, JSON.stringify(mp_cache, null, '\t'), function (err, result) {
        if (err) console.log('mp_cache save error', err);
    });
    //console.log('task complete')
}
async function taskreply(task, mc_msg, console_msg, discord_msg) {
    switch (task.source) {
        case 'minecraft-dm':
            bot.chat(`/m ${task.minecraftUser} ${mc_msg}`);
            break;
        case 'console':
            console.log(console_msg)
            break;
        case 'discord':
            console.log(`Discord Reply not implemented ${discord_msg}`);
            break;
        default:
            break;
    }
}
async function notImplemented(task) {
    taskreply(task, "Not Implemented", "Not Implemented", "Not Implemented")
}
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
async function readConfig(file) {
    var raw_file = await fsp.readFile(file);
    var com_file = await JSON.parse(raw_file);
    return com_file;
}
function getIndex(vec, size) {
    return vec.z + vec.x * size.z + (-vec.y) * (size.x * size.z);
}
function getPosition(index, size) {
    return v(Math.floor((index % (size.x * size.z)) / size.z), -Math.floor(index / (size.x * size.z)), (index % size.z));
}
function pos_in_box(pos, start, end) {
    if (pos.x < start.x || pos.y > start.y || pos.z < start.z) return false;
    if (pos.x > end.x || pos.y < end.y || pos.z > end.z) return false;
    return true;
}
module.exports = clearArea