function oesolise(string, useOrthodoxRule) {
    const choseong1 = ['ᴊ','ᴊᴊ','ʟ','c','cc','ƨ','ᴅ','ᵾ','ᵾᵾ','ʌ','ʌʌ','','ʌ̅','ʌ̅ʌ̅','ƛ','ᴊ̵','ᴇ','z̵','ô']
    const choseong2 = ['ᴊ','ᴊᴊ','ʟ','c','cc','ƨ','ᴅ','ᵾ','ᵾᵾ','ʌ','ʌʌ','o','ʌ̅','ʌ̅ʌ̅','ƛ','ᴊ̵','ᴇ','z̵','ô']
    const jungseong1 = ['h','hı','k','kı','q','qı','εլ','εլı','⊥','⊥̌h','⊥̌hı','⊥̌ı','⫫','ᴛ','ᴛq','ᴛqı','ᴛı','⫪','ᴜ','ᴜı','l']
    const jungseong2 = ['h','hl','k','kl','q','ql','εլ','εլl','⊥','⊥h','⊥hi','⊥l','⫫','ᴛ','ᴛq','ᴛql','ᴛl','⫪','ᴜ','ᴜl','l']
    const jongseong = ['','ᴊ','ᴊᴊ','ᴊʌ','ʟ','ʟʌ̅','ʟô','c','ƨ','ƨᴊ','ƨᴅ','ƨᵾ','ƨʌ','ƨᴇ','ƨz̵','ƨô','ᴅ','ᵾ','ᵾʌ','ʌ','ʌʌ','o','ʌ̅','ƛ','ᴊ̵','ᴇ','z̵','ô']

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
        else {
            outbuf += String.fromCodePoint(cp)
        }
    })

    return outbuf
}
