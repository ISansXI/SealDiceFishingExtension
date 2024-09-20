class Tuple {
    elements: any[];
    constructor(...elements) {
        this.elements = elements;
    }

    get length() {
        return this.elements.length;
    }

    get(index) {
        return this.elements[index];
    }

    toString() {
        return this.toString();
    }

}

class Location {
    //地点
    constructor() {
        //WIP
    }
}

class Bait {
    //鱼饵
    constructor() {
        //WIP
    }
}

class FishingGear {
    //渔具(包括了鱼竿、渔具箱等除了饵料以外的全部钓鱼设备)
    constructor() {
        //WIP
    }
}

class Fish {
    //鱼
    name: string;
    description: string;
    lengthData: Tuple;
    heightData: Tuple;
    weightData: Tuple;
    poster: string;
    posterId: string;
    updateTimestamp: number;
    limit: Tuple;
    locations: Location[];
    bonus: Tuple;
    cpEffect: any;
    id: string;
    constructor(id: string, name: string, description: string, lengthData: Tuple, heightData: Tuple, weightData: Tuple, poster: string, posterId: string, locations: Array<Location>, limit: Tuple, bonus: Tuple, cpEffect: Tuple) {
        /**
        * 鱼种类的构造方法
        * @param id 鱼种类的唯一ID
        * @param name 鱼的名字
        * @param description 鱼的介绍
        * @param lengthData 鱼的长度数据范围[最低,最高,最可能值,左曲率,右曲率]
        * @param weightData 鱼的重量数据范围[最低,最高,最可能值,左曲率,右曲率]
        * @param heightData 鱼的高度数据范围[最低,最高,最可能值,左曲率,右曲率]
        * @param poster 上传者的名称
        * @param posterId 上传者的唯一ID（用于后续修改）
        * @param locations 鱼会出没的地点
        * @param limit 钓鱼限制[角色等级,渔具等级,鱼饵等级,偏好鱼饵Tags[]]
        * @param bonus 钓到了后的奖励以及鱼的价值[经验, 钱币价值(单位cp)[最低,最高]]
        * @param cpEffect 钱币奖励根据长高重的比例乘数，越大占据奖励的比重越高[长权重,高权重,重量权重]
        */
        this.id = id;
        this.name = name;
        this.description = description;
        this.lengthData = lengthData;
        this.heightData = heightData;
        this.weightData = weightData;
        this.poster = poster;
        this.posterId = posterId;
        this.updateTimestamp = Date.now();
        this.locations = locations;
        this.limit = limit;
        this.bonus = bonus;
        this.cpEffect = cpEffect;
    }

    getUpdateTime() {
        return formatDateToLocalDate(new Date(this.updateTimestamp));
    }

    catchNew() {
        const lD = this.lengthData;
        const wD = this.weightData;
        const hD = this.heightData;
        let fishLength = gNV(lD.get(0), lD.get(1), lD.get(2), lD.get(3), lD.get(4));
        let fishHeight = gNV(hD.get(0), hD.get(1), hD.get(2), hD.get(3), hD.get(4));
        let fishWeight = gNV(wD.get(0), wD.get(1), wD.get(2), wD.get(3), wD.get(4));
        const vWSum = this.cpEffect.get(0) + this.cpEffect.get(1) + this.cpEffect.get(2);
        const inputMin = (lD.get(0) * this.cpEffect.get(0) + hD.get(0) * this.cpEffect.get(1) + wD.get(0) * this.cpEffect.get(2)) / vWSum;
        const inputMax = (lD.get(1) * this.cpEffect.get(0) + hD.get(1) * this.cpEffect.get(1) + wD.get(1) * this.cpEffect.get(2)) / vWSum;
        const inputValue = (fishLength * this.cpEffect.get(0) + fishHeight * this.cpEffect.get(1) + fishWeight * this.cpEffect.get(2)) / vWSum;
        let fishCpValue = Math.floor(nonlinearMap(inputValue, inputMin, inputMax, this.bonus.get(1).get(0), this.bonus.get(1).get(1)));
        let fishBeenCaught = new FishEntity(this.id, fishLength, fishHeight, fishWeight, Date.now(), this.bonus.get(0), fishCpValue);
        return fishBeenCaught;
    }
}

class FishEntity {
    baseId: string;
    length: number;
    height: number;
    weight: number;
    timestamp: number;
    xpGained: number;
    cpValue: number;

    constructor(baseId: string, length: number, height: number, weight: number, timestamp: number, xpGained: number, cpValue: number) {
        this.baseId = baseId;
        this.length = length;
        this.height = height;
        this.weight = weight;
        this.timestamp = timestamp;
        this.xpGained = xpGained;
        this.cpValue = cpValue;
    }
}

function gNV(minValue, maxValue, mostLikelyValue, leftSkew, rightSkew) {
    return generateNormalValue(minValue, maxValue, mostLikelyValue, leftSkew, rightSkew);
}
function generateNormalValue(minValue, maxValue, mostLikelyValue, leftSkew, rightSkew) {
    /**
     * 这个方法用于计算钓出的鱼的各项数值
     */
    // 计算标准差，这里简单地使用曲率的绝对值
    const stdDev = Math.abs(leftSkew) + Math.abs(rightSkew);

    // 正态分布的均值
    const mean = mostLikelyValue;

    // 使用Box-Muller变换生成正态分布的随机数
    function boxMullerTransform() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); // 防止log(0)的情况
        while (v === 0) v = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z;
    }

    // 生成数值并确保其在minValue和maxValue之间
    let generatedValue;
    do {
        generatedValue = mean + boxMullerTransform() * stdDev;
    } while (generatedValue < minValue || generatedValue > maxValue);

    return generatedValue;
}

function nonlinearMap(value, inputMin, inputMax, outputMin, outputMax) {
    // 使用指数映射，你可以根据需要调整指数参数
    const exponent = 2; // 指数参数，可以根据需要进行调整
    const normalizedValue = (value - inputMin) / (inputMax - inputMin);
    const mappedValue = outputMin + (outputMax - outputMin) * Math.pow(normalizedValue, exponent);
    return mappedValue;
}

function formatDateToLocalDate(date: Date) {
    const formattedDateTime = date.toLocaleString('zh-CN', {
        hour12: false
    });
    return formattedDateTime;
}

export {
    Tuple,
    Fish,
    FishEntity,
    formatDateToLocalDate
}
