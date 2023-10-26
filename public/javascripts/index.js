let waldo 
let loadStart
let targets = ["Waldo", "Cactus", "Camera", "WinterWoolies"]
let leaderboard = []
let gamer_reset 

class WaldosWhere {
    constructor () {
        this.img = document.getElementById("waldoBeachScene")
        // this.img.onload = (evt) => { 
            console.log("img load")
            this.img_loaded = Date.now() 
        // }

        this._selection = document.getElementById("_selection")
        this._select_targets_dlg = document.getElementById("_select_targets_dlg")
        this._select_target = document.getElementById("_select_target")
        this._select_target_ok = document.getElementById("_select_target_ok")
        this._select_target_result_dlg = document.getElementById("_select_target_result_dlg")
        this._select_result_lis = this._select_target_result_dlg.querySelectorAll("li")
        
        this._results_dlg = document.getElementById("_results_dlg")
        this.player = document.getElementById("player")
        this.result = document.querySelector("li.result")
        this.results_li_targets = document.querySelectorAll("._results_dlg li.target")
        this.register = this._results_dlg.querySelector("button.results_ok")
        this.cancel = this._results_dlg.querySelector("button.results_xok")
       
        this.register.addEventListener("click", (evt) => { this.register_results(evt) })
        this.cancel.addEventListener("click", (evt) => { this.cancel_results(evt) })
        
        this.img_rect = this.img.getBoundingClientRect()

        this.img.addEventListener("mousedown", (evt) => { this.handleMouseDown(evt) })
        this.img.addEventListener("mouseup", (evt) => { this.handleMouseUp(evt) })
        this._select_target_ok.addEventListener("click", (evt) => { this.target_selected(evt) })
        
        this._selected = {}
        this.targets = {
            Waldo: { x_min: 1220, y_min: 450, x_max: 1270, y_max: 520 },
            Cactus: { x_min: 1770, y_min: 485, x_max: 1805, y_max: 545 },
            Camera: { x_min: 375, y_min: 660, x_max: 405, y_max: 690 },
            WinterWoolies: { x_min: 450, y_min: 1140, x_max: 490, y_max: 1260 }
        }
        this.scores = { }
        this.img_rect.x = this.img_rect.x + window.scrollX
        this.img_rect.y = this.img_rect.y + window.scrollY   
    }
    handleMouseDown = (evt) => {
        evt.preventDefault()
        this.targeting_reset()
        this.mousedown = {
            ox: evt.offsetX,
            oy: evt.offsetY,
            px: evt.pageX, 
            py: evt.pageY
        }    ///[[evt.offsetX, evt.offsetY]]
        console.log(["down", [evt.offsetX, evt.offsetY].toString(), [evt.pageX, evt.pageY].toString() ])
    }
    handleMouseUp = (evt) => {
        evt.preventDefault()
        // if((Math.abs(evt.offsetX - this.mousedown.ox) - Math.abs(evt.offsetY - this.mousedown.oy)) < 3 ) { return }
 
        this.mouseup = {
            ox: evt.offsetX,
            oy: evt.offsetY,
            px: evt.pageX, 
            py: evt.pageY
        } 
        console.log(["up", [evt.offsetX, evt.offsetY].toString(), [evt.pageX, evt.pageY].toString() ])
        let sleft, stop, swidth, sheight
        this._selected.x_min = sleft = Math.round(Math.min(this.mousedown.px, this.mouseup.px) - this.img_rect.x)
        this._selected.y_min = stop = Math.round(Math.min(this.mousedown.py, this.mouseup.py) - this.img_rect.y)
        swidth = Math.round(this.mousedown.px > this.mouseup.px ? this.mousedown.px - this.mouseup.px : this.mouseup.px - this.mousedown.px)
        this._selected.x_max = sleft + swidth 
        sheight = Math.round(this.mousedown.py > this.mouseup.py ? this.mousedown.py - this.mouseup.py : this.mouseup.py - this.mousedown.py)
        this._selected.y_max = stop + sheight
        
        this._selection.style.left  = sleft + "px";
        this._selection.style.top = stop + "px" 
        this._selection.style.width = swidth +"px";
        this._selection.style.height = sheight + "px";
        this._selection.style.display = "block"

        this._select_targets_dlg.style.left  = ( sleft + swidth + 5) + "px";
        this._select_targets_dlg.style.top = ( stop + 5)+ "px" 
        this._select_target.selectedIndex = 0
     
        this._select_targets_dlg.style.display = "block"

    }

    // waldo._selected -> Object { x_min: 1228, x_max: 1264, y_min: 453, y_max: 513 }
    // waldo.targets.Waldo -> Object { x_min: 1230, x_max: 1265, y_min: 460, y_max: 520 }
    // waldo.iou(waldo._selected, waldo.targets.Waldo) -> 0.7331163547599675 

    iou = (bbx1, bbx2) => {
        // intersection over union
        // https://stackoverflow.com/questions/25349178/calculating-percentage-of-bounding-box-overlap-for-image-detector-evaluation/42874377#42874377
        let x_left = Math.max(bbx1.x_min, bbx2.x_min)
        let y_top = Math.max(bbx1.y_min, bbx2.y_min)
        let x_right = Math.min(bbx1.x_max, bbx2.x_max)
        let y_bottom = Math.min(bbx1.y_max, bbx2.y_max)
        if (x_right < x_left || y_bottom < y_top) { return 0 } 
        let intersect_area = (x_right - x_left) * (y_bottom - y_top)
        let bb1_area = (bbx1.x_max - bbx1.x_min) * (bbx1.y_max - bbx1.y_min)
        let bb2_area = (bbx2.x_max - bbx2.x_min) * (bbx2.y_max - bbx2.y_min)
        return Number(intersect_area / (bb1_area + bb2_area - intersect_area).toFixed(3))
    }

    target_selected = (evt) => {
        if (this._select_target.selectedIndex === 0) return
        console.log(this._select_target.value)
        let _IoU = Number(this.iou(this._selected, this.targets[this._select_target.value]).toFixed(4))
        let current;
        if (_IoU < 0.25) { current = "low" }
          else if (_IoU >= 0.25 && _IoU < 0.5) { current = "poor" }
          else if (_IoU >= 0.5 && _IoU < 0.75) { current = "average" }
          else if (_IoU >= 0.75 ) { current = "high" }
        this.scores[this._select_target.value] = { iou: _IoU, precision: current, time: (Date.now() - this.img_loaded) / 1e3, selected: this._selected }

        this.scoring()
        this.targeting_reset()
        this.targeting_results()
    }
    targeting_reset = () => {
        this._selected = {}
        // hide dialog & selection
        this._selection.style.display = "none"
        this._select_targets_dlg.style.display = "none"

    }
    targeting_results = () => {
        // show results
        this._select_target_result_dlg.style.display = "block"
        this._select_target_result_dlg.style.left = this._select_targets_dlg.style.left
        this._select_target_result_dlg.style.top = this._select_targets_dlg.style.top
        let t = this._select_target.value
        this._select_result_lis[0].textContent = `selected target: ${t} `
        this._select_result_lis[1].textContent = `select IoU: ${this.scores[t].iou}  precision: ${this.scores[t].precision} `
        // this._select_result_lis[2].textContent = `selected bounds: [${this.scores[t].selected.x_min}, ${this.scores[t].selected.y_min}, ${this.scores[t].selected.x_max}, ${this.scores[t].selected.y_max}] `
        // this._select_result_lis[3].textContent = `targeted bounds: [${this.targets[t].x_min}, ${this.targets[t].y_min}, ${this.targets[t].x_max}, ${this.targets[t].y_max}] `
        setTimeout(()=>{ this._select_target_result_dlg.style.display = "none" }, 3000 )
    }
    scoring = () => {
        let target_keys = Object.keys(this.targets)
        let score_keys = Object.keys(this.scores)
        let complete = (score_keys.length === target_keys.length) // not yet complete
      
        let ious = 0;
        let maxt = 0;
        let low = 0 // < .25
        let poor = 0 // 0.25 - 0.5
        let avg = 0 // 0.5 - 0.75
        let hi = 0
        let current = ""

        score_keys.forEach(key => {
          ious += this.scores[key].iou;
          if (this.scores[key].iou < 0.25) { low += 1 }
          else if (this.scores[key].iou >= 0.25 && this.scores[key].iou < 0.5) { poor += 1 }
          else if (this.scores[key].iou >= 0.5 && this.scores[key].iou < 0.75) { avg += 1 }
          else if (this.scores[key].iou >= 0.75 ) { hi += 1 }
          maxt = this.scores[key].time > maxt ? this.scores[key].time : maxt;
          console.log([score_keys.length, this.scores[key].iou, this.scores[key].precision, ious, maxt, complete])
        });
        
        if (complete) {
            this.final_results()
        }
        
      }
    final_results = () => {
    /*    
    waldo.scores = {
        "Camera": {
        "iou": 0.4889,
        "precision": "poor",
        "time": 9.078,
        "selected": {
            "x_min": 381,
            "y_min": 664,
            "x_max": 401,
            "y_max": 686
        }
        },
        "Waldo": {
        "iou": 0.7269,
        "precision": "average",
        "time": 17.33,
        "selected": {
            "x_min": 1221,
            "y_min": 460,
            "x_max": 1269,
            "y_max": 513
        }
        },
        "Cactus": {
        "iou": 0.7278,
        "precision": "average",
        "time": 26.233,
        "selected": {
            "x_min": 1772,
            "y_min": 484,
            "x_max": 1810,
            "y_max": 538
        }
        }
    }
    */
        this.player.value = ""
        this._results_dlg.style.display = "block"
        this._results_dlg.style.left = Math.round(window.scrollX + 50) + "px"
        this._results_dlg.style.top = Math.round(window.scrollY + 20) + "px"

        this.ious = 0;
        this.maxt = 0;
        let skeys = Object.keys(this.scores).sort((a,b) => {return b > a});
        skeys.forEach((key, idx) => {
            // idx = 0
            this.ious += this.scores[key].iou
            this.maxt =  this.scores[key].time > this.maxt ?  this.scores[key].time : this.maxt
            this.results_li_targets[idx].querySelector("span.target").textContent = key
            this.results_li_targets[idx].querySelector("span.iou").textContent = this.scores[key].iou
            this.results_li_targets[idx].querySelector("span.precision").textContent = this.scores[key].precision  
        })
        let position = leaderboard.filter(plyr => plyr.time < this.maxt).length + 1
        let suffix
        if (position < 6) {
            switch (position) {
                case 1: suffix = "st"; break;
                case 2: suffix = "nd"; break;
                case 3: suffix = "rd"; break;
                default: suffix = "th"
            } 
        }
        alert("Your're an ACE !\n--------------------------\n\nYour time puts you at " + position + suffix + " on the leader board \nregister your time + score!")
        this.result.textContent = Math.round(this.ious * 100 / skeys.length) + "% accuracy in " + this.maxt.toFixed(3) + " secs" ;
    }

    register_results = async (evt) => {
        let player_score = {
            name: this.player.value,
            score: Math.round(this.ious * 100 / Object.keys(this.scores).length),
            time: this.maxt
        }
        let reg_resp = await fetch("/register_score", { 
            method: "post", 
            headers: { "Content-Type": "application/json"}, 
            body: JSON.stringify(player_score) })
        let res = await reg_resp.json()
        if (res._id) {
            console.log("successfully registered player / score")
            console.log(res)
        } else {
            console.log(res)
        }
        setTimeout(this.cancel_results, 5000)
    }
    cancel_results = (evt) => {
        this._results_dlg.style.display = "none"
    }
    // messy don't bother
    handleMouseMove = (evt) => {
        evt.preventDefault()
        this.mouseup = {
            ox: evt.offsetX,
            oy: evt.offsetY,
            px: evt.pageX, 
            py: evt.pageY
        } 
        console.log(["up", [evt.offsetX, evt.offsetY].toString(), [evt.pageX, evt.pageY].toString() ])
        
        let sleft = Math.min(this.mousedown.px, evt.pageX) - this.img_rect.x
        let stop = Math.min(this.mousedown.py, evt.pageY) - this.img_rect.y
        let swidth = this.mousedown.px > evt.pageX ? this.mousedown.px - evt.pageX : evt.pageX - this.mousedown.px
        let sheight = this.mousedown.py > evt.pageY ? this.mousedown.py - evt.pageY : evt.pageY - this.mousedown.py

        this._selection.style.left  = sleft + "px";
        this._selection.style.top = stop + "px" 
        this._selection.style.width = swidth +"px";
        this._selection.style.height = sheight + "px";
        this._selection.style.display = "block"

    }
}

get_leaders = async () => { retval = await fetch("leaderboard"); return await retval.json() }

reset = async () => {
    waldo = new WaldosWhere();
    leaderboard = await get_leaders() 
    set_leaders()
}

set_leaders = () => {
    leaders = document.querySelectorAll("li.leaders")
    leaderboard.forEach((plyr, idx) => {
        spans = leaders[idx].querySelectorAll("span")
        spans[0].textContent = plyr.time 
        spans[1].textContent = plyr.score
        spans[2].textContent = plyr.name 
    } )
}

window.onload = async () => {
    waldo = new WaldosWhere()
    leaderboard = await get_leaders() 
    set_leaders()

    game_reset = document.querySelector("button.reset")
    game_reset.addEventListener("click", async (evt) => { reset(evt) } )
}