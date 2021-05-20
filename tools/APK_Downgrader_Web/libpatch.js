/*

Copyright (C) 2018 hack64.net
Modified by ComputerElite
*/

if(!Array.prototype.fill)
{
    var fill = function(v, start, end)
    {
        for(var i = start; i < end; i++)
        {
            this[i] = v;
        }
    }

    Array.prototype.fill = fill;
    Uint8Array.prototype.fill = fill;
}

(function(_this){
/*************/

const IN_WORKER = (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope);
var sitePath = ""
try {
    sitePath = window.location.href;
    if(sitePath.endsWith("/")) sitePath = sitePath.substring(0, sitePath.length - 1)
    sitePath = sitePath.substring(0, sitePath.lastIndexOf("/") + 1)
    console.log('current dir: ' + sitePath)
} catch {}



_this.applyPatch = applyPatch;
_this.applyPatchAsync = applyPatchAsync;

const ERR_PATCH_CHECKSUM = 'Patch checksum mismatch - patch file may be corrupt to downgrade';
const ERR_SOURCE_CHECKSUM = 'Source checksum mismatch - patch is not meant for this APK. Try backing the APK up again in case it is corrupted.';
const ERR_TARGET_CHECKSUM = 'Target checksum mismatch - something failes while downgrading';
const ERR_UNKNOWN_FORMAT = 'Unknown patch format';
const ERR_FORMAT_VERSION = 'Unhandled format version';
const ERR_GENERIC_DECODE = 'Decoding error';
const ERR_UNIMPLEMENTED = 'Unimplemented feature';

if(!_this.performance)
{
    _this.performance = {
        now: function()
        {
            console.log('performance object unavailable');
            return 1;
        }
    }
}

function adler32(arr, offs, size)
{
    var a = 1, b = 0;
    for(var i = 0; i < size; i++)
    {
        a = (a + arr[offs + i]) % 65521;
        b = (b + a) % 65521;
    }

    return ((b << 16) | a) >>> 0;
}

function strtest(u8arr, str)
{
    for(var i = 0; i < str.length; i++)
    {
        if(u8arr[i] != str.charCodeAt(i))
        {
            return false;
        }
    }
    return true;
}

function bytecopy(dst, dstOffs, src, srcOffs, size)
{
    var subsrc = src.subarray(srcOffs, srcOffs + size);
    dst.set(subsrc, dstOffs);
}

function applyPatch(sourceData, patchData, ignoreChecksums, patchFilename, downgrades, isSync = false)
{
    ignoreChecksums = ignoreChecksums || false;
    var header = new Uint8Array(patchData);
    var decrReg = /.+_[0-9\.]+TO[0-9\.]+\.decr/g;
    
    var formats = [
        { sig: '\xD6\xC3\xC4', name: 'vcdiff', applyPatch: applyPatchVCD }
    ];

    for(var i in formats)
    {
        var fmt = formats[i];

        if(strtest(header, fmt.sig))
        {
            var timeStart, timeEnd;
            var targetData;

            console.log('libpatch: test applying ' + fmt.name + ' patch...');
            timeStart = _this.performance.now();
            targetData = fmt.applyPatch(sourceData, patchData, ignoreChecksums);
            timeEnd = _this.performance.now();
            console.log('libpatch: took ' + (timeEnd - timeStart).toFixed(3) + 'ms');
            return new Promise((resolve, reject) => {
                resolve(targetData)
            });
        }
    }
    if(decrReg.test(patchFilename)) {
        console.log("libpatch: old decr patch detected.")
        var versionRegex = /[0-9\.]+TO[0-9\.]+/g
        var vers = patchFilename.match(versionRegex)[0].split("TO")
        var SV = vers[0]
        var TV = vers[1]
        var appid = patchFilename.substring(0, versionRegex.exec(patchFilename).index - 1)
        console.log(`extracted infos from FileName: SV: ${SV}, TV: ${TV}, appid: ${appid}`)
        var timeStart, timeEnd;
        var targetData;

        var patcher = new DecrPatcher();
        var downgrade = patcher.GetVersion(downgrades, SV, TV, appid, false)
        if(downgrade == null) {
            console.log("libpatch: Entry not found.")
            alert(`Version ${SV} to ${TV} of ${appid} doesn't seem to exist. Aborting due to lack of information.`)
            return new Promise((resolve, reject) => {
                resolve("")
            });
        }
        console.log("Downgrade found: ")
        console.log(downgrade)

        timeStart = _this.performance.now();
        return new Promise((resolve, reject) => {
            patcher.sourceData = sourceData
            patcher.patchData = patchData

            patcher.applyDecr(ignoreChecksums, downgrade, isSync).then(function(result) {
                console.log(result)
                timeEnd = _this.performance.now();
                console.log('libpatch: took ' + (timeEnd - timeStart).toFixed(3) + 'ms');
                resolve(result);
            })
         });
        
    } else {
        throw new Error(ERR_UNKNOWN_FORMAT);
    }
}

class DecrPatcher {
    sourceData = null
    patchData = null
    targetData = null

    applyDecr(ignoreChecksums, downgrade, isSync) {
        return new Promise((resolve, reject) => {
            if(!ignoreChecksums) {
                console.log("Calculating SSHA256")
                if(isSync) this.updateProgress(0.03)
                this.GetSHA256(this.sourceData).then((SSHA256) => {
                    console.log("finished: " + SSHA256)
                    if(SSHA256 != downgrade["SSHA256"]) {
                        console.log("SSHA256 mismatch")
                        throw new Error(ERR_SOURCE_CHECKSUM)
                    }
                    console.log("Calculating DSHA256")
                    this.updateProgress(0.08)
                    this.GetSHA256(this.patchData).then((DSHA256) => {
                        console.log("finished: " + DSHA256)
                        if(DSHA256 != downgrade["DSHA256"]) {
                            console.log("DSHA256 mismatch")
                            throw new Error(ERR_PATCH_CHECKSUM)
                        }
                        console.log("Hashes match. downgrading.")
                        this.XOR(downgrade["TargetByteSize"], isSync);
                        if(isSync) this.updateProgress(0.98)
                        GetSHA256(this.targetData).then((TSHA256) => {
                            if(TSHA256 != downgrade["TSHA256"]) {
                                console.log("TSHA256 mismatch")
                                throw new Error(ERR_TARGET_CHECKSUM)
                            }
                            if(isSync) this.updateProgress(1)
                            resolve(this.targetData)
                        })
                    })
                })
            }
        });
        
    }

    updateProgress(ratio)
    {
        document.querySelector('#progress-bar').style.width = (ratio * 100) + '%';
    }
    
    XOR(targetLength, isSync) {
        this.targetData = new ArrayBuffer(targetLength)
        console.log("XORing")
        for (let i = 0; i < targetLength; i++) {
            if(i%1000000 == 0) {
                if(isSync) this.updateProgress(0.1 + i / targetLength * 0.95);
                console.log(i + " / " + targetLength + " (" + (i / targetLength * 100) + " %)")
            }
            this.targetData[i] = this.sourceData[i]^this.patchData[i];
        }
        console.log("XORed")
    }
    
    GetSHA256(input) {
        return new Promise((resolve, reject) => {
            crypto.subtle.digest('SHA-256', input).then((x) => {
                console.log(x)
                const hashArray = Array.from(new Uint8Array(x));                     // convert buffer to byte array
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string 
                resolve(hashHex)
            })
        })
    }
    
    GetVersion(downgrades, SV, TV, appid, isXDelta3) {
        var outp = null
        downgrades["versions"].forEach(element => {
            if (this.RemoveDotZero(element["SV"]) == this.RemoveDotZero(SV) && this.RemoveDotZero(element["TV"]) == this.RemoveDotZero(TV) && appid == element["appid"] && element["isXDelta3"] == isXDelta3) { outp = element; return false;}
            else if (this.RemoveDotZero(element["SV"]) == this.RemoveDotZero(TV) && this.RemoveDotZero(element["TV"]) == this.RemoveDotZero(SV) && element["SourceByteSize"] == element["TargetByteSize"] && appid == element["appid"] && element["isXDelta3"] == isXDelta3) { outp = element; return false;}
        });
        return outp
    }
    
    RemoveDotZero(input)
    {
        var done = false;
        input = input.toString()
        while(!done)
        {
            if (input.endsWith("0")) input = input.substring(0, input.length - 1);
            else if (input.endsWith(".")) input = input.substring(0, input.length - 1);
            else done = true;
        }
        return input;
    }
}



function applyPatchAsync(sourceData, patchData, config, patchFilename, downgrades)
{
    var patchWorker = new Worker(applyPatchAsync.WORKER_URL);

    var ignoreChecksums = config.ignoreChecksums || false;

    var onpatchend = config.onpatchend || null;
    var onprogress = config.onprogress || null;
    var onerror = config.onerror || null;
    
    var callbacks = {
        'patchend': onpatchend,
        'progress': onprogress,
        'error':    onerror
    };

    patchWorker.onmessage = function(e)
    {
        var msg = e.data;

        if(callbacks[msg.evtType])
        {
            callbacks[msg.evtType](msg.param);
        }
    }

    var msg = {
        sourceData: sourceData,
        patchData: patchData,
        ignoreChecksums: ignoreChecksums,
        patchFilename: patchFilename,
        downgrades: downgrades
    };

    patchWorker.postMessage(msg);
}

applyPatchAsync.WORKER_URL = (function()
{
    if(IN_WORKER)
    {
        return null;
    }

    var WORKER_SOURCE = [
    'importScripts("' + sitePath + 'libpatch.js", "' + sitePath + 'lzma.js");',
    '',
    'self.onmessage = function(e)',
    '{',
    '    var sourceData = e.data.sourceData;',
    '    var patchData = e.data.patchData;',
    '    var ignoreChecksums = e.data.ignoreChecksums;',
    '    var patchFilename = e.data.patchFilename;',
    '    var downgrades = e.data.downgrades;',
    '    ',
    '    try',
    '    {',
    '        applyPatch(sourceData, patchData, ignoreChecksums, patchFilename, downgrades).then(function(result) {',
    '                self.postMessage({ evtType: \'patchend\', param: result });',
    '                self.close()',
    '            }',
    '        })',
    '    }',
    '    catch(e)',
    '    {',
    '        console.log(e);',
    '        self.postMessage({ evtType: \'error\', param: e.message });',
    '    }',
    '}'].join('');
    
    var workerURL = URL.createObjectURL(new Blob([WORKER_SOURCE]));

    return workerURL;
})();


function ProgressBroadcaster()
{
    this.ratio = 0.0;
}

ProgressBroadcaster.prototype.update = function(ratio)
{
    if(IN_WORKER && (ratio - this.ratio) >= 0.01)
    {
        // post progress update to the main thread if ratio has increased by 1+%
        self.postMessage({ evtType: 'progress', param: ratio });
        this.ratio = ratio;
    }
}

function PatchStream(ab, littleEndian)
{
    this.ab = ab;
    this.u8 = new Uint8Array(ab);
    this.dv = new DataView(ab);
    this.offset = 0;
    this.littleEndian = littleEndian || false;
}

PatchStream.prototype = {
    seek: function(offset)
    {
        this.offset = offset;
    },
    skip: function(numBytes)
    {
        this.offset += numBytes;
    },
    isEOF: function()
    {
        return (this.offset >= this.ab.byteLength);
    },
    readBytes: function(dst, dstOffs, numBytes)
    {
        // read bytes into a u8 array
        bytecopy(dst, dstOffs, this.u8, this.offset, numBytes);
        this.skip(numBytes);
    },
    _readInt: function(dvType, numBytes)
    {
        var val = this.dv[dvType](this.offset, this.littleEndian);
        this.offset += numBytes;
        return val;
    },
    readU8: function()
    {
        return this._readInt('getUint8', 1);
    },
    readU16: function()
    {
        return this._readInt('getUint16', 2);
    },
    readU24: function()
    {
        if(!this.littleEndian)
        {
            return (this.readU16() << 8) | this.readU8();
        }
        return this.readU16() | (this.readU8() << 16);
    },
    readU32: function()
    {
        return this._readInt('getUint32', 4);
    },
    readU64: function()
    {
        var a = this.readU32();
        var b = this.readU32();

        if(this.littleEndian)
        {
            return ((b * 0x100000000) + a);
        }

        return ((a * 0x100000000) + b);
    }
};

// VCDiff (xdelta)
// https://tools.ietf.org/html/rfc3284

// hdrIndicator
const VCD_DECOMPRESS = (1 << 0);
const VCD_CODETABLE  = (1 << 1);
const VCD_APPHEADER  = (1 << 2); // nonstandard?

// winIndicator
const VCD_SOURCE  = (1 << 0);
const VCD_TARGET  = (1 << 1);
const VCD_ADLER32 = (1 << 2);

// COPY address modes
const VCD_SELF = 0;
const VCD_HERE = 1;

// deltaIndicator - secondary compression
const VCD_DATACOMP = (1 << 0);
const VCD_INSTCOMP = (1 << 2);
const VCD_ADDRCOMP = (1 << 3);

const VCD_NOOP = 0, VCD_ADD = 1, VCD_RUN = 2, VCD_COPY = 3;

const VCDDefaultCodeTable = (function()
{
    var table = [];

    var empty = {inst: VCD_NOOP, size: 0, mode: 0};

    // 0
    table.push([{inst: VCD_RUN, size: 0, mode: 0}, empty]);

    // 1,18
    for(var size = 0; size <= 17; size++)
    {
        table.push([{inst: VCD_ADD, size: size, mode: 0}, empty]);
    }

    // 19,162
    for(var mode = 0; mode <= 8; mode++)
    {
        table.push([{inst: VCD_COPY, size: 0, mode: mode}, empty]);
        
        for(var size = 4; size <= 18; size++)
        {
            table.push([{inst: VCD_COPY, size: size, mode: mode}, empty]);
        }
    }

    // 163,234
    for(var mode = 0; mode <= 5; mode++)
    {
        for(var addSize = 1; addSize <= 4; addSize++)
        {
            for(var copySize = 4; copySize <= 6; copySize++)
            {
                table.push([{inst:  VCD_ADD, size: addSize,  mode: 0},
                            {inst: VCD_COPY, size: copySize, mode: mode}]);
            }
        }
    }

    // 235,246
    for(var mode = 6; mode <= 8; mode++)
    {
        for(var addSize = 1; addSize <= 4; addSize++)
        {
            table.push([{inst:  VCD_ADD, size: addSize, mode: 0},
                        {inst: VCD_COPY, size:       4, mode: mode}]);
        }
    }

    // 247,255
    for(var mode = 0; mode <= 8; mode++)
    {
        table.push([{inst: VCD_COPY, size: 4, mode: mode},
                    {inst:  VCD_ADD, size: 1, mode: 0}]); 
    }

    return table;
})();

function VCDStream(arrayBuffer, offset)
{
    PatchStream.call(this, arrayBuffer);
    this.offset = offset;
}

VCDStream.prototype = Object.create(PatchStream.prototype);

VCDStream.prototype.readnum = function()
{
    var num = 0, bits = 0;

    do {
        bits = this.readU8();
        num = (num << 7) + (bits & 0x7F); 
    } while(bits & 0x80);

    return num;
}

function VCDCache(config)
{
    this.near = new Array(config.nearSize);
    this.nearSize = config.nearSize;
    this.nextSlot = 0;

    this.same = new Array(config.sameSize * 256);
    this.sameSize = config.sameSize;
    
    this.reset();
}

VCDCache.prototype.reset = function()
{
    this.nextSlot = 0;
    this.near.fill(0);
    this.same.fill(0);
}

VCDCache.prototype.update = function(addr)
{
    if(this.nearSize > 0)
    {
        this.near[this.nextSlot] = addr;
        this.nextSlot = (this.nextSlot + 1) % this.nearSize;
    }

    if(this.sameSize > 0)
    {
        this.same[addr % (this.sameSize * 256)] = addr;
    }
}

VCDCache.prototype.decodeAddress = function(copyAddrStream, mode, here)
{
    var addr = 0;
    var m = 0;

    if(mode == VCD_SELF)
    {
        addr = copyAddrStream.readnum();
    }
    else if(mode == VCD_HERE)
    {
        addr = here - copyAddrStream.readnum();
    }
    else if((m = (mode - 2)) >= 0 && m < this.nearSize) // near cache
    {
        addr = this.near[m] + copyAddrStream.readnum();
    }
    else // same cache
    {
        m = mode - (2 + this.nearSize);
        addr = this.same[m*256 + copyAddrStream.readU8()];
    }
    
    this.update(addr);
    return addr;
}

function VCDHeader(patchStream)
{
    patchStream.skip(4); // skip over the magic number

    this.indicator = patchStream.readU8();
    this.secDecompressorId = 0;
    this.codeTableDataLength = 0;
    this.appDataLength = 0;

    if(this.indicator & VCD_DECOMPRESS)
    {
        this.secDecompressorId = patchStream.readU8();
        console.log("secondary decompressor:" + this.secDecompressorId);
    }

    if(this.indicator & VCD_CODETABLE)
    {
        this.codeTableDataLength = patchStream.readnum();
        console.log("code table is used");
    }

    if(this.indicator & VCD_APPHEADER)
    {
        // ignore app header data
        this.appDataLength = patchStream.readnum();
        patchStream.skip(this.appDataLength);
    }
}

function VCDWindowHeader(patchStream)
{
    this.indicator = patchStream.readU8();
    this.sourceSegmentLength = 0;
    this.sourceSegmentPosition = 0;
    this.adler32 = 0;
    this.haveChecksum = false;

    if(this.indicator & (VCD_SOURCE | VCD_TARGET))
    {
        this.sourceSegmentLength = patchStream.readnum();
        this.sourceSegmentPosition = patchStream.readnum();
    }

    this.deltaLength = patchStream.readnum();
    this.targetWindowLength = patchStream.readnum();
    this.deltaIndicator = patchStream.readU8(); // secondary compression
    
    this.dataLength = patchStream.readnum();
    this.instrsLength = patchStream.readnum();
    this.copysLength = patchStream.readnum();

    if(this.indicator & VCD_ADLER32) 
    {
        this.adler32 = patchStream.readU32();
        this.haveChecksum = true;
    }

    //if(this.deltaIndicator != 0)
    //{
    //    // deltaIndicator":7,
    //    console.log(JSON.stringify(this));
    //    throw new Error(ERR_UNIMPLEMENTED);
    //}
}

function vcdPrecalculateTargetSize(patchStream)
{
    var targetSize = 0;
    var header = new VCDHeader(patchStream);

    while(!patchStream.isEOF())
    {
        var winHeader = new VCDWindowHeader(patchStream);
        targetSize += winHeader.targetWindowLength;
        patchStream.skip(winHeader.dataLength + winHeader.copysLength + winHeader.instrsLength);
    }

    patchStream.offset = 0;
    return targetSize;
}

function applyPatchVCD(sourceData, patchData, ignoreChecksums)
{
    var sourceU8 = new Uint8Array(sourceData);
    var patchStream = new VCDStream(patchData, 0);

    var targetSize = vcdPrecalculateTargetSize(patchStream);
    var targetData = new ArrayBuffer(targetSize);
    var targetU8 = new Uint8Array(targetData);

    var progress = new ProgressBroadcaster();

    var header = new VCDHeader(patchStream);

    var cache = null;
    var codeTable = null;

    if(header.secDecompressorId != 0)
    {
        console.log("sec decompressor " + header.secDecompressorId);
        throw new Error(ERR_UNIMPLEMENTED); // secondary decompressor
    }

    if(header.codeTableDataLength == 0)
    {
        cache = new VCDCache({ nearSize: 4, sameSize: 3 });
        codeTable = VCDDefaultCodeTable;
    }
    else
    {
        console.log("code table");
        throw new Error(ERR_UNIMPLEMENTED); // custom code table
    }

    var targetWindowPosition = 0;

    while(!patchStream.isEOF())
    {
        var winHeader = new VCDWindowHeader(patchStream);

        var dataStream, instructionStream, copyAddrStream;

        if(winHeader.deltaIndicator & VCD_DATACOMP)
        {
            // TODO: secondary decompressor implementation here
        }
        else
        {
            dataStream = new VCDStream(patchData, patchStream.offset);
        }

        if(winHeader.deltaIndicator & VCD_INSTCOMP)
        {

        }
        else
        {
            instructionStream = new VCDStream(patchData, dataStream.offset + winHeader.dataLength);
        }

        if(winHeader.deltaIndicator & VCD_ADDRCOMP)
        {

        }
        else
        {
            copyAddrStream = new VCDStream(patchData, instructionStream.offset + winHeader.instrsLength);
        }

        var instructionStreamEndOffs = copyAddrStream.offset;

        var targetWindowOffs = 0; // offset within the current target window

        var copySourceU8 = null;

        if(winHeader.indicator & VCD_SOURCE)
        {
            copySourceU8 = sourceU8;
        }
        else if(winHeader.indicator & VCD_TARGET)
        {
            copySourceU8 = targetU8;
        }

        cache.reset();

        while(instructionStream.offset < instructionStreamEndOffs)
        {
            var codeTableIndex = instructionStream.readU8();
            var code = codeTable[codeTableIndex];

            for(var i = 0; i <= 1; i++)
            {
                var op = code[i].inst;

                if(op == VCD_NOOP)
                {
                    continue;
                }

                var length = code[i].size || instructionStream.readnum();

                switch(op)
                {
                case VCD_ADD:
                    dataStream.readBytes(targetU8, targetWindowPosition + targetWindowOffs, length);
                    targetWindowOffs += length;
                    break;
                case VCD_RUN:
                    var runByte = dataStream.readU8();
                    var offs = targetWindowPosition + targetWindowOffs;
                    targetU8.fill(runByte, offs, offs + length);
                    targetWindowOffs += length;
                    break;
                case VCD_COPY:
                    var addr = cache.decodeAddress(copyAddrStream, code[i].mode, winHeader.sourceSegmentLength + targetWindowOffs);
                    var absAddr = 0;

                    // source segment and target segment are treated as if they're concatenated
                    if(addr >= winHeader.sourceSegmentLength)
                    {
                        absAddr = targetWindowPosition + (addr - winHeader.sourceSegmentLength);
                        copySourceU8 = targetU8;
                    }
                    else
                    {
                        absAddr = winHeader.sourceSegmentPosition + addr;
                        if(winHeader.indicator & VCD_SOURCE)
                        {
                            copySourceU8 = sourceU8;
                        }
                    }

                    while(length--)
                    {
                        targetU8[targetWindowPosition + targetWindowOffs++] = copySourceU8[absAddr++];
                    }
                    break;
                }
            }

            progress.update((targetWindowPosition + targetWindowOffs) / targetSize);
        }

        if(winHeader.haveChecksum && !ignoreChecksums)
        {
            var testAdler32 = adler32(targetU8, targetWindowPosition, winHeader.targetWindowLength);

            if(winHeader.adler32 != testAdler32)
            {
                throw new Error(ERR_TARGET_CHECKSUM);
            }
        }

        patchStream.skip(winHeader.dataLength + winHeader.copysLength + winHeader.instrsLength);
        targetWindowPosition += winHeader.targetWindowLength;
    }

    return targetData;
}

})(this);