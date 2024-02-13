import SimulationModelModdle from "simulation-bridge-datamodel/DataModel";

export const getCostDriversFromScenario = (getData) => {
    const scenario = getData().getCurrentScenario();

    if (scenario) {
        const costDrivers = scenario.resourceParameters.costDrivers;
        if (costDrivers) {
            const uniqueCostDrivers = Array.from(new Map(costDrivers.map(item => [item.id, item])).values());
            return uniqueCostDrivers;
        }
    }
    return [];
};

export const mapAbstractDriversFromConcrete = (concreteCostDrivers) => {
    let abstractCostDriversMap = new Map();
    concreteCostDrivers.forEach(el => {
        let concreteDriver = SimulationModelModdle.getInstance().create("simulationmodel:ConcreteCostDriver", {
            id: el.id,
            name: el.name,
            cost: el.cost,
        });
        if (!abstractCostDriversMap.has(el.category)) {
            let abstractDriver = SimulationModelModdle.getInstance().create("simulationmodel:AbstractCostDriver", {
                id: el.category,
                name: el.category,
                concreteCostDrivers: [concreteDriver]
            });
            abstractCostDriversMap.set(el.category, abstractDriver);
        } else {
            let abstractDriver = abstractCostDriversMap.get(el.category);
            abstractDriver.concreteCostDrivers.push(concreteDriver);
        }
    }
    );
    return Array.from(abstractCostDriversMap.values());
};

export const saveAllCostDrivers = async (abstractCostDrivers, getData) => {
    getData().getCurrentScenario().resourceParameters.costDrivers = abstractCostDrivers;
    await getData().saveCurrentScenario();
};

export const saveCostVariant = async (allCostDrivers, variant, //variants,
    updatedVariants, getData) => {
    //save variants and its mappings
    let driversMappings = variant.mappings.map(mapping => {
        return SimulationModelModdle.getInstance().create("simulationmodel:DriversMapping", {
            abstractDriver: mapping.abstractDriver,
            concreteDriver: mapping.concreteDriver,
        });
    });

    let variantExtended = SimulationModelModdle.getInstance().create("simulationmodel:VariantExtended", {
        id: variant.id,
        name: variant.name,
        frequency: variant.frequency,
        mappings: driversMappings,
    });
    let updatedVariantsObject = [...updatedVariants.filter(v => v.id !== variant.id), variantExtended];
    const environmentMappingConfig =
        SimulationModelModdle.getInstance().create("simulationmodel:EnvironmentMappingConfig", {
            variants: updatedVariantsObject,
        });
    getData().getCurrentScenario().resourceParameters.environmentMappingConfig = environmentMappingConfig;
    await getData().saveCurrentScenario();

    saveCostVariantConfig(getData, allCostDrivers);
    await getData().saveCurrentScenario();
};

export const saveCostVariantConfig = async (getData, allCostDrivers) => {
    const scenario = getData().getCurrentScenario();

    if (!scenario) {
        return;
    }

    let formattedVariants = [];
    const variants = scenario.resourceParameters.environmentMappingConfig.variants;
    variants.forEach(v => {
        let drivers = [];
        v.mappings.forEach(m => {
            const concreteDriver = allCostDrivers
                .flatMap(driver => driver.concreteCostDrivers)
                .find(driver => driver.id === m.concreteDriver);
            const driver = SimulationModelModdle.getInstance().create("simulationmodel:Driver", {
                id: m.abstractDriver,
                cost: concreteDriver ? concreteDriver.cost : 0,
            });
            drivers.push(driver);
        });

        console.log('Drivers:', drivers);
        let costVariant = SimulationModelModdle.getInstance().create("simulationmodel:Variant", {
            id: v.name,
            frequency: v.frequency,
            drivers: drivers,
        });
        formattedVariants.push(costVariant);
    });

    let costVariantConfig = SimulationModelModdle.getInstance().create("simulationmodel:CostVariantConfig", {
        count: formattedVariants.length,
        variants: formattedVariants,
    });

    getData().getCurrentScenario().models[0].modelParameter.costVariantConfig = costVariantConfig;
    await getData().saveCurrentScenario();
}

export const deleteVariant = async (variantId, variants, getData, toasting) => {
    //delete from configuration

    const environmentMappingConfig = SimulationModelModdle.getInstance().create("simulationmodel:EnvironmentMappingConfig", {
        variants: getData().getCurrentScenario()
            .resourceParameters.environmentMappingConfig.variants.filter(v => v.id !== variantId),
    });
    getData().getCurrentScenario().resourceParameters.environmentMappingConfig = environmentMappingConfig;
    await getData().saveCurrentScenario();

    // Delete variant from CostVariantConfig for team B
    let costVariantConfig = getData().getCurrentScenario().resourceParameters.costVariantConfig;
    const updatedCostVariantConfig = { ...costVariantConfig };

    updatedCostVariantConfig.variants = updatedCostVariantConfig.variants.filter(v => v.id !== variantId);
    updatedCostVariantConfig.count = updatedCostVariantConfig.variants.length;
    
    getData().getCurrentScenario().models[0].modelParameter.CostVariantConfig = updatedCostVariantConfig;
    await getData().saveCurrentScenario();

    toasting("info", "Variant deleted", "Cost variant deleted successfully");
};