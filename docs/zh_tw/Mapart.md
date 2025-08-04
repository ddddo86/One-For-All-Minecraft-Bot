# 地圖畫 Bot 使用教學

| Link | Description |
|---|---|
| [Step0.](Mapart.md#step0-責任聲明) | 責任聲明 |
| [Step1.](Mapart.md#step1-設定材料站) | 設定材料站及station.json說明 |
| [Step2.](Mapart.md#step2-前置作業) | 使用前本帳需要進行的前置作業 |
| [Step3.](Mapart.md#step3-開始蓋畫) | 讓 bot 開始為你工作 |

## Step0. 責任聲明

使用時即代表同意 [EULA](/eula.md) 和以下幾點:

1. **著作權和版權：** 地圖畫的著作權歸原始創作者所有。使用本 Bot 生成的地圖畫可能涉及他人的著作權和版權。請確保你具有合法權利或獲得了相關授權，以使用和分享生成的地圖畫。

2. **法律責任：** 使用本 Bot 生成的地圖畫應遵守適用的法律法規。使用者應自行承擔因使用地圖畫而可能導致的法律責任和糾紛。

3. **地圖畫內容：** 使用本 Bot 生成的地圖畫可能包含圖像、文字、標誌等內容。請確保生成的地圖畫內容不包含任何侵犯他人權益、違反道德、宣揚暴力或歧視的內容。

4. **免責聲明：** 本 Bot 的開發者和維護者對於使用本 Bot 生成的地圖畫所造成的任何損失、糾紛或責任不承擔任何責任。使用者應自行承擔使用本 Bot 的所有風險和後果。

5. 使用本 Bot 時須遵守伺服器內版權及年齡分級等規定:

| [廢土地圖畫版權規定](https://discord.com/channels/358942292352040970/465960604427878420/846712252169977856)
 | [廢土地圖畫分級規定](https://discord.com/channels/358942292352040970/465960604427878420/925808493951340585) |
| [廢土地圖畫分級展示規定](https://discord.com/channels/358942292352040970/465960604427878420/858618967248732206) | [地圖畫判定標準與後續解釋事宜](https://discord.com/channels/358942292352040970/465960604427878420/1157959585680851054)

## Step1. 設定材料站

首先，你必須要先擁有一個材料站，可參考傳點 `/warp JKLoveJK_2` `/warp ddddo_10`(此版本同樣適用蒟蒻地圖畫bot)，目前沒有提供藍圖(我懶，可能之後補上)

接下來需要設定各項參數，這部分會有億點點的坐牢，一共有3個檔案: `station.json`, `global/mapart.json`, `<bot>/mapart.json` 

| [station.json](Mapart.md#stationjson-填寫說明) | [global/mapart.json](Mapart.md#mapartjson-填寫說明) | [global/mapart.json](Mapart.md#mapartjson-填寫說明) |

### station.json 填寫說明

檔案路徑: `./config/global/station.json`

如果資料夾內沒有這個檔案的話，可以從[這裡](https://github.com/JKLoveUU/One-For-All-Minecraft-Bot/blob/main/docs/zh_tw/files/station_example.json)下載範例檔案進行修改


```json
{
	"stationName": "Mapart",                //材料站名稱(可自定義)
	"stationWarp": "ddddo_10",              //材料站傳點
	"stationServer": 39,                    //材料站所在分流   
	"offset":{                              //偏移值 以範例材料站建造的話不需修改
		"N":	[0,1,-3],
		"S":	[0,1,3],
		"W":	[-3,1,0],
		"E":	[3,1,0],
		"bN":	[0,1,-2],
		"bS":	[0,1,2],
		"bW":	[-2,1,0],
		"bE":	[2,1,0]
	},
	"overfull":[-7777,67,-773,"S","bN"],   //當材料有多且放不回盒內時會統一放在這裡
	"materials":[
        ["white_wool",        [-7745,67,-764,"N","bN"]],
		["orange_wool",       [-7746,67,-764,"N","bN"]],
		["magenta_wool",      [-7747,67,-764,"N","bN"]],
		["light_blue_wool",   [-7748,67,-764,"N","bN"]],
		["yellow_wool",       [-7749,67,-764,"N","bN"]],
		["lime_wool",         [-7750,67,-764,"N","bN"]],
		["pink_wool",         [-7751,67,-764,"N","bN"]],
		["gray_wool",         [-7752,67,-764,"N","bN"]],
		["light_gray_wool",   [-7753,67,-764,"N","bN"]],
		["cyan_wool",         [-7754,67,-764,"N","bN"]],
		["purple_wool",       [-7755,67,-764,"N","bN"]],
		["blue_wool",         [-7756,67,-764,"N","bN"]],
		["brown_wool",        [-7757,67,-764,"N","bN"]],
		["green_wool",        [-7758,67,-764,"N","bN"]],
		["red_wool",          [-7759,67,-764,"N","bN"]],
		["black_wool",        [-7760,67,-764,"N","bN"]],
		["map",			   	  [-7761,67,-764,"N","bN"]],

        ["white_terracotta",      [-7761,67,-764,"N","bN"]],
		["orange_terracotta",     [-7762,67,-764,"N","bN"]], 
		["magenta_terracotta",    [-7763,67,-764,"N","bN"]],
		["light_blue_terracotta", [-7764,67,-764,"N","bN"]],
		["yellow_terracotta",     [-7765,67,-764,"N","bN"]],
		["lime_terracotta",       [-7766,67,-764,"N","bN"]],
		["pink_terracotta",       [-7767,67,-764,"N","bN"]],
		["gray_terracotta",       [-7768,67,-764,"N","bN"]],
		["light_gray_terracotta", [-7769,67,-764,"N","bN"]],
		["cyan_terracotta",       [-7770,67,-764,"N","bN"]],
		["purple_terracotta",     [-7771,67,-764,"N","bN"]],
		["blue_terracotta",       [-7772,67,-764,"N","bN"]],
		["brown_terracotta",      [-7773,67,-764,"N","bN"]],
		["green_terracotta",      [-7774,67,-764,"N","bN"]],
		["red_terracotta",        [-7775,67,-764,"N","bN"]],
		["black_terracotta",      [-7776,67,-764,"N","bN"]],

		["birch_planks",			[-7745,67,-773,"S","bS"]],
		["oak_planks",				[-7746,67,-773,"S","bS"]],
		["jungle_planks",			[-7747,67,-773,"S","bS"]],
		["spruce_planks",			[-7748,67,-773,"S","bS"]],
		["crimson_planks",			[-7749,67,-773,"S","bS"]],
		["warped_planks",			[-7750,67,-773,"S","bS"]],
		["crimson_hyphae",			[-7751,67,-773,"S","bS"]],
		["warped_hyphae",			[-7752,67,-773,"S","bS"]],
		["netherrack",				[-7753,67,-773,"S","bS"]],
		["crimson_nylium",			[-7754,67,-773,"S","bS"]],
		["warped_nylium",			[-7755,67,-773,"S","bS"]],
		["warped_wart_block",		[-7756,67,-773,"S","bS"]],
		["glow_lichen",				[-7757,67,-773,"S","bS"]],
		["prismarine_bricks",		[-7758,67,-773,"S","bS"]],
		["slime_block",				[-7759,67,-773,"S","bS"]],
		["oak_leaves",				[-7760,67,-773,"S","bS"]],
		["emerald_block",			[-7761,67,-773,"S","bS"]],
		["packed_ice",				[-7762,67,-773,"S","bS"]],
		["quartz_block",			[-7763,67,-773,"S","bS"]],
		["clay",					[-7764,67,-773,"S","bS"]],
		["mushroom_stem",			[-7765,67,-773,"S","bS"]],
		["iron_block",				[-7766,67,-773,"S","bS"]],
		["raw_iron_block",			[-7767,67,-773,"S","bS"]],
		["cobblestone",				[-7768,67,-773,"S","bS"]],
		["cobbled_deepslate",		[-7769,67,-773,"S","bS"]],
		["lapis_block",				[-7770,67,-773,"S","bS"]],
		["redstone_block",			[-7771,67,-773,"S","bS"]],
		["gold_block",				[-7772,67,-773,"S","bS"]],
		["dirt",					[-7773,67,-773,"S","bS"]],
		["birch_leaves",			[-7774,67,-773,"S","bS"]],
		["dripstone_block",			[-7775,67,-773,"S","bS"]]
	  ]
}

### station.json 座標填寫說明

```json
[-1000,50,300,"S","bS"]
```

前三位數 `1000, 50, 300` 代表界伏盒的的 `<x> <y> <z>`

後兩項 `"S", "bS"` 請參考以下圖片<img src="https://github.com/JKLoveUU/One-For-All-Minecraft-Bot/blob/main/docs/zh_tw/images/station_direction.jpg"  width="60%" height="30%">

邏輯為: 以界伏盒為中心，材料站的走道位置位於界伏盒的哪個方向，`"bS"` 的 `b` 則代表按鈕，如果是以範例材料站建成則遵照說明填寫即可

### mapart.json 填寫說明

尚未編輯，請參考 [這個檔案](/setting.md)

## Step2. 前置作業

1. 首先你得先框一個蓋畫用的領地，這裡不做教學

2. 給你的 bot /tt 和 /pt 權限

3. 蓋一張地圖畫約20~40分鐘，如果預計會不夠，請先購買好領地飛行

4. 將 bot /tpa 至蓋畫領地內任意位置

## Step3. 開始蓋畫

接下來就可以蓋畫了，以下是流程，詳細指令說明在 [地圖畫指令](/Mapart_Commands.md)

1. 設定起始座標
```
/m <bot> mapart set <filename> <x> <y> <z>
```
2. 開始建造
```
/m <bot> mapart build -a
```

接下來正常來說 bot 就會開始工作，其餘詳細要怎麼暫停、停止，或細部設定請到 [地圖畫指令](/Mapart_Commands.md) 查看