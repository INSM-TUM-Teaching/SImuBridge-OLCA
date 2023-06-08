import React, { useEffect, useState } from 'react'
import {
  Input, FormControl, FormLabel, Button, Stack, Select, Accordion, Box,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { stateToDistribution } from '../../../util/Distributions';
import DistributionEditor from '../../DistributionEditor';
import TimeUnits from '../../../util/TimeUnits';

const currencies = ['euro', 'dollar'];


const EditScenario = ({getData, setIsInDuplicateMode}) => {

  const [state, setState] = useState({
    scenarioName: "",
    startingDate: "",
    startingTime: "",
    currency: "",
    numberOfInstances: ""
  });

  useEffect(() => {
    const selectedScenarioData = getData().getCurrentScenario();
    if (!selectedScenarioData) return;
    setState({
      scenarioName: selectedScenarioData.scenarioName,
      startingDate: selectedScenarioData.startingDate,
      startingTime: selectedScenarioData.startingTime,
      currency: selectedScenarioData.currency,
      numberOfInstances: selectedScenarioData.numberOfInstances
    })
    console.log(state)
    console.log(state.distributionValues)
  }, [getData().getCurrentScenario()]);


  function handleInputChange(resource) {
    const target = resource.target;
    const value = target.value;
    const name = target.name;
    
    setState({
      ...state,
      [name]: value
    });
  }

  function onSubmit(event){
    event.preventDefault();

    let obj = getData().getCurrentScenario();

    if (obj.scenarioName !== state.scenarioName) {
      getData().renameScenario(obj, state.scenarioName);
    }

    obj.scenarioName = state.scenarioName
    obj.startingDate = state.startingDate
    obj.startingTime = state.startingTime
    obj.currency = state.currency
    obj.numberOfInstances = state.numberOfInstances

    getData().saveScenario(obj);
  }

  return (
    <>
      <Box w="100%">
        <Stack gap="3">
          <Button onClick={() => setIsInDuplicateMode(true)}
            colorScheme='#ECF4F4'
            variant='outline'
            w="100%"
            border='1px'
            borderColor='#B4C7C9'
            color='#6E6E6F'
            _hover={{ bg: '#B4C7C9' }}> Duplicate Scenario </Button>



          <form onSubmit={onSubmit}>


                  <FormControl>
                    <FormLabel>Scenario Name:</FormLabel>
                    <Input value={state.scenarioName} bg="white" name="scenarioName" onChange={(event) => handleInputChange(event)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Starting Date:</FormLabel>
                    <Input value={state.startingDate} bg="white" name="startingDate" onChange={(event) => handleInputChange(event)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Starting time:</FormLabel>
                    <Input value={state.startingTime} bg="white" name="startingTime" onChange={(event) => handleInputChange(event)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Number of Process Instances:</FormLabel>
                    <Input value={state.numberOfInstances} bg="white" name="numberOfInstances" onChange={(event) => handleInputChange(event)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Currency:</FormLabel>
                    <Select name="currency" value={state.currency} bg="white" onChange={(event) => handleInputChange(event)} >
                        {currencies.map((currency) => (<option key={currency} value={currency}>{currency}</option>))}
                    </Select>
                  </FormControl>


            <Button
              type="submit"
              colorScheme='#ECF4F4'
              w="100%"
              variant='outline'
              border='1px'
              borderColor='#B4C7C9'
              color='#6E6E6F'
              mt="5"
              _hover={{ bg: '#B4C7C9' }}> Save changes </Button>


          </form>
        </Stack>
      </Box>
    </>
  )
}



export default EditScenario;