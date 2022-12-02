import { Text } from '@chakra-ui/react';
import {React, useState, useEffect} from 'react'
import TabBar from '../Background/TabBar';

function ResourcePage(props) {

    useEffect(() =>{
        props.setCurrent("Resource Parameters")
      },[props])


    const [tabs, setTabs] = useState([
        {
        tabname: "Organisational Chart",
        content: <Text>Organisational Chart content</Text> 
        },
        {
          tabname: "Timetabel",
          content: <Text>Timetable content</Text> 
        },
    
    ])


    return (
        <>
            <TabBar items={tabs}/>
            {props.getData("currentModel").parameters.roles.map((element) => {
                    return <Text>{element.name}</Text>
            })}
        </>
    )
}

export default ResourcePage;