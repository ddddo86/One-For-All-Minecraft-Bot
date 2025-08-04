# 地圖畫指令

## 主要指令
```
mapart
map
mp
```
使用方式
```
/m <bot> mapart/map/mp
```

## 指令

### 設定
```
- set <args>
```
格式
```
set <filename> <x> <y> <z>
```

範例
```
/m <bot> mapart set mapart.nbt -7232 100 -2369

/m <bot> mapart set 雜魚納西達/mapart_0_0.nbt -7232 100 -2369   # 如果檔案存於資料夾內
```

讀取的資料夾為 `config/global/mapart.json` 內設定的路徑，預設為`.minecraft/schematics`

*使用此指令會檢查座標是否符合地圖畫規範，若有設定其他座標需求，須於`config/<bot>/mapart.json` 自行設定

### 建造
```
- build <args>
- b <args>
```
格式
| Args      | Description   |
| --------- | ------------- |
| `-auto <index>`| 自動蓋到找不到檔案(若未指定 則蓋到找不到下張檔案)       |
| `-a <index>`| ..      |
| `-server <server>` | 自動模式下 只需第一張設定 後續將自動套用相同設定 可以不選        |
| `-s <server>` | .. |
| `-n`        | 關閉Discord通知       |

範例
```
/m <bot> mapart build -a  # 自動設定蓋到找不到下張檔案
```
```
/m <bot> mapart build -a 3_3  # 自動蓋到 3_3 (含) 停止   
```
```
/m <bot> mapart build -s 67   # 設定在67分流蓋，並自動傳去67分流
```
```
/m <bot> mapart build -n  # 蓋完不發送Discord通知
```
```
/m <bot> mapart build -a -n   # 只發送最後一張Discord結束通知
```
```
/m <bot> mapart build -a -n -s 67     # 只發送最後一張Discord結束通知
```

### 暫停
```
- pause
- p
```
範例
```
/m <bot> mapart pause
```
用於暫停建造

### 繼續
```
- resume
- r
```
範例
```
/m <bot> mapart resume
```
用於繼續建造

### 中止
```
- stop
- s
```
範例
```
/m <bot> mapart stop
```
用於中止建造

### 查詢
```
- info
- i
```

範例
```
/m <bot> mapart info
```

bot 會回報當前檔案名稱及建造進度 

---

(暫時編輯到這裡，下方保留舊版說明)

### **開圖**
- open
- o

請自行確保背包有空間放
/warp傳送後 在該位置 按設定大小開圖

*目前沒有設定指令 需於config/`<bot>`/mapart.json 自行設定

#### example
`/m bot mapart open`

---

### **命名**
- name
- n

命名地圖畫 `&b0-0`

若有設定名稱則會是 `MapartName &r- &b0-0`

~~或許之後會多從一開始 和 單index(0-n)~~

*目前沒有設定指令 需於config/`<bot>`/mapart.json 自行設定
#### example
`/m bot mapart name`

---

### **複印**
- copy
- c

複印指定張數地圖畫 不可大於 64

*目前沒有設定指令 需於config/`<bot>`/mapart.json 自行設定
#### example
`/m bot mapart copy`


---

### **分裝**
- wrap
- w

於input shulker box 中 取出

並放出 output shulker box 後 點及按鈕分裝

*目前沒有設定指令 需於config/`<bot>`/mapart.json 自行設定
#### example
`/m bot mapart wrap`

