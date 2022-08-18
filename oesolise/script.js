const charmap = {r:'ᴊ',s:'ʟ',e:'c',f:'ƨ',a:'ᴅ',q:'ᵾ',t:'ʌ',d:'o',w:'ʌ̅',c:'ƛ',z:'ᴊ̵',x:'ᴇ',v:'z̵',g:'ô',_:'',k:'h',i:'k',j:'q',u:'εլ',h:'⟂',H:'⟂̌',y:'⫫',n:'ᴛ',N:'ᴛ̌',b:'⫪',m:'ᴜ',l:'l',L:'ı'} // Keys: KS X 5002 keyboard layout
Array.prototype.oesolmap = function() { return this.map(s=>[...s].flatMap(c=>charmap[c]).join('')) }

function oesolise(string, useOrthodoxRule) {
    const choseong1 = ['r','rr','s','e','ee','f','a','q','qq','t','tt','_','w','ww','c','z','x','v','g'].oesolmap()
    const choseong2 = ['r','rr','s','e','ee','f','a','q','qq','t','tt','d','w','ww','c','z','x','v','g'].oesolmap()
    const jungseong1 = ['k','kL','i','iL','j','jL','u','uL','h','Hk','HkL','HL','y','n','Nj','NjL','NL','b','m','mL','L'].oesolmap()
    const jungseong2 = ['k','kl','i','il','j','jl','u','ul','h','hk','hkl','hl','y','n','nj','njl','nl','b','m','ml','l'].oesolmap()
    const jongseong = ['_','r','rr','rt','s','sw','sg','e','f','fr','fa','fq','ft','fx','fq','fg','a','q','qt','t','tt','d','w','c','z','x','v','g'].oesolmap()
    const hangulcompat = ['r','rr','rt','s','sw','sg','e','ee','f','fr','fa','fq','ft','fx','fq','fg','a','q','qq','qt','t','tt','d','w','ww','c','z','x','v','g'].oesolmap().concat(jungseong1)

    let outbuf = ''

    const chars = [...string]

    chars.map(it => it.codePointAt(0)).forEach(cp => {
        if (0xAC00 <= cp && cp <= 0xD7A3) {
            let base = cp - 0xAC00
            let indexInitial = (base / 588)|0
            let indexPeak = ((base / 28)|0) % 21
            let indexFinal = base % 28
            outbuf += (useOrthodoxRule ? choseong1 : choseong2)[indexInitial]
            outbuf += (useOrthodoxRule ? jungseong1 : jungseong2)[indexPeak]
            outbuf += jongseong[indexFinal]
        }
        else if (0x3131 <= cp && cp <= 0x3163) {
            outbuf += hangulcompat[cp - 0x3131]
        }
        else {
            outbuf += String.fromCodePoint(cp)
        }
    })

    return outbuf
}
