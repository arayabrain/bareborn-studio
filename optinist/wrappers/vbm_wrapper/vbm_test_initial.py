from datetime import datetime

from optinist.api.dataclass.dataclass import *
from optinist.wrappers.vbm_wrapper import utility

""" vbm_test_initial.py
Test an initial node in a workflow of the voxel-based morphometry (VBM) analysis.
"""


def vbm_test_initial(
        image_data: ImageData,
        params: dict=None
) -> dict(analysis_info_out=AnalysisInfo):

    print('\n"vbm_test_initial" node started.')

    # Check the alignment params.
    # {'alignments':
    #   [
    #     {'image_id': <>, 'x_pos': <>, 'x_resize': <>, 'x_rotate': <>, 'y_pos': <>, 'y_resize': <>, 'y_rotate': <>,
    #      'z_pos': <>, 'z_resize': <>, 'z_rotate': <>},
    #     {...}, ...
    #   ]
    # }
    params = image_data.params
    print('\n[Alignment params]')
    for alignment_params in params['alignments']:
        print(f'Image ID: {alignment_params["image_id"]}')
        for key, value in alignment_params.items():
            if key != 'image_id':
                print(f'  {key}: {value}')

    # Get the project ID.
    project_id = utility.get_project_id()
    print(f'\n[Project ID] {project_id}')

    # DEBUG: Get the project path.
    project_path = r'../../test_data/cjs/test_project'

    # Set a path list of the workflow input files as input files.
    input_path_list = []
    for alignment_params in params['alignments']:
        # file_path = get_file_path(project_id, alignment_params['image_id'])
        file_path = alignment_params['image_id']
        input_path_list.append(file_path)

    # DEBUG
    input_path_list = [
        os.path.join(project_path, 'T2_H477_SU007.nii'),
        os.path.join(project_path, 'Yagishita_Yagishita_20210929_H329_Chimerin_3_1_1.nii')
    ]

    # Initialize an AnalysisInfo object for output.
    analysis_info_out = AnalysisInfo(input_path_list, project_path)

    analysis_info_out.analysis_start_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # DEBUG: Create the aligned files in the derivative folder (just copied).
    import shutil
    output_folder_path = os.path.join(project_path, 'derivatives', 'alignment')
    os.makedirs(output_folder_path, exist_ok=True)
    for wf_input_path in input_path_list:
        try:
            input_file_name = os.path.basename(wf_input_path)
            output_file_path = os.path.join(output_folder_path, input_file_name)
            shutil.copyfile(wf_input_path, output_file_path)

            # Set the output file paths and analysis status.
            analysis_info_out.set_output_file_paths(wf_input_path, output_file_path)
            analysis_info_out.set_analysis_status(wf_input_path, AnalysisStatus.PROCESSED)
        except(RuntimeError) as error:
            analysis_info_out.set_analysis_status(wf_input_path, AnalysisStatus.ERROR)
            analysis_info_out.set_message(wf_input_path, utility.get_error_message(error))
        except(Exception) as error:
            analysis_info_out.set_analysis_status(wf_input_path, AnalysisStatus.ERROR)
            analysis_info_out.set_message(wf_input_path, utility.get_error_message(error))

    analysis_info_out.analysis_end_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    print('\n"vbm_test_initial" node finished.')

    return {'analysis_info_out': analysis_info_out}


# Test
if __name__ == '__main__':
    print('\n[vbm_test_initial test]')

    image_data = type('ImageData', (object,), {
        'params': {'alignments': [{'image_id': '/lib/test.nii',
                                   'x_pos': 64, 'x_resize': 1, 'x_rotate': 0,
                                   'y_pos': 48, 'y_resize': 1, 'y_rotate': 0,
                                   'z_pos': 80, 'z_resize': 1, 'z_rotate': 0},
                                  {'image_id': '/lib/test0.nii',
                                   'x_pos': 64, 'x_resize': 1, 'x_rotate': 0,
                                   'y_pos': 48, 'y_resize': 1, 'y_rotate': 0,
                                   'z_pos': 80, 'z_resize': 1, 'z_rotate': 0}]}
    })

    # Run the node analysis.
    info = vbm_test_initial(image_data)

    # Check the results.
    analysis_info_out = info['analysis_info_out']

    print(f'\n[Project path] {analysis_info_out.project_path}')

    wf_input_path_list = analysis_info_out.workflow_input_file_path_list
    print('\n[workflow_input_file_path_list]')
    for wf_input_path in wf_input_path_list:
        print(wf_input_path)

    print('\n[Analysis results]')
    for wf_input_path in analysis_info_out.workflow_input_file_path_list:
        output_file_paths = analysis_info_out.get_output_file_paths(wf_input_path)
        print(f'\n{wf_input_path}')
        print(f'  Status: {analysis_info_out.get_unit_analysis_status(wf_input_path)}')
        print(f'  Output paths: {output_file_paths}')
        print(f'  Message: {analysis_info_out.get_message(wf_input_path)}')

    print(f'\nTest finished.')
