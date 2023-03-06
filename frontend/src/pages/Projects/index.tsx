import {Box, Button, styled} from "@mui/material";
import React, {useMemo, useState} from 'react'
import TableComponent from "../../components/Table";
import {useNavigate} from "react-router-dom";

const Projects = () => {
  const navigate = useNavigate()
    const [data, setData] = useState([
        {
            id: '1',
            name: 'prj name 1',
            created: '2023/02/24',
            updated: '2023/02/24',
            images: ['','',''],
        },
        {
            id: '2',
            name: 'prj name 2',
            created: '2023/02/24',
            updated: '2023/02/24',
            images: ['','','',''],
        },
    ])

    const onEdit = (id : any) => {
        console.log('edit: ', id)
    }

    const onWorkflow = (id : any) => {
        console.log('Workflow: ', id)
    }

    const onResults = (id : any) => {
        console.log('Results: ', id)
    }
    
    const addNewProject = () => {
      navigate('/project/new-project')
    }

    const columns = useMemo(
        () => [
            { title: 'Project Name', name: 'name' },
            { title: 'Created', name: 'created' },
            { title: 'Updated', name: 'updated' },
            { title: 'Images', name: 'images', render: (data : any) => (
                    <p>({data.images.length})</p>
                ), },
            {
                title: '',
                name: 'action',
                width: 185,
                render: (data: any) => (
                    <BoxButton>
                        <ButtonAdd variant="contained" onClick={() => onEdit(data.id)}>Edit</ButtonAdd>
                        <ButtonAdd variant="contained" onClick={() => onWorkflow(data.id)}>Workflow</ButtonAdd>
                        <ButtonAdd variant="contained" onClick={() => onResults(data.id)}>Results</ButtonAdd>
                    </BoxButton>
                ),
            },
        ],
        [],
    )
    return (
        <ProjectsWrapper>
            <ProjectsTitle>Projects</ProjectsTitle>
            <BoxButton>
                <ButtonAdd variant="contained" onClick={addNewProject}>Add</ButtonAdd>
                <ButtonAdd variant="contained">Project</ButtonAdd>
            </BoxButton>
            <TableComponent
                paginate={{ total: 100, page: 1, page_size: 10 }}
                data={data}
                columns={columns}
            />
        </ProjectsWrapper>
    )
};

const ProjectsWrapper = styled(Box)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(2),
}))

const ProjectsTitle = styled('h1')(({ theme }) => ({}))

const BoxButton = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
}))

const ButtonAdd = styled(Button)(({ theme }) => ({
    margin: theme.spacing(2, 0),
    minWidth: 80,
    paddingLeft: theme.spacing( 2),
    paddingRight: theme.spacing( 2)
}))

export default Projects