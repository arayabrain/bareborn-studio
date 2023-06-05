from datetime import datetime

from optinist.api.dataclass.dataclass import *
from optinist.wrappers.vbm_wrapper import utility

""" vbm_test_processing.py
Test a processing node in a workflow of the voxel-based morphometry (VBM) analysis.
"""


def vbm_test_processing(
        analysis_info_in: AnalysisInfo,
        params: dict=None
) -> dict(analysis_info_out=AnalysisInfo):

    print('\n"vbm_test_processing" node started.')

    # Initialize an AnalysisInfo object for output.
    wf_input_path_list = analysis_info_in.workflow_input_file_path_list
    project_path = analysis_info_in.project_path
    analysis_info_out = AnalysisInfo(wf_input_path_list, project_path)

    analysis_info_out.analysis_start_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    import shutil
    output_folder_path = os.path.join(project_path, 'derivatives', 'masking')
    os.makedirs(output_folder_path, exist_ok=True)
    for wf_input_path in wf_input_path_list:
        try:
            input_file_name = os.path.splitext(os.path.basename(wf_input_path))[0]
            output_file_paths = [
                os.path.join(output_folder_path, input_file_name + '_masking_1.nii'),
                os.path.join(output_folder_path, input_file_name + '_masking_2.nii')
            ]
            for output_file_path in output_file_paths:
                shutil.copyfile(wf_input_path, output_file_path)

            # Set the output file paths and analysis status.
            analysis_info_out.set_output_file_paths(wf_input_path, output_file_paths)
            analysis_info_out.set_analysis_status(wf_input_path, AnalysisStatus.PROCESSED)
        except(RuntimeError) as error:
            analysis_info_out.set_analysis_status(wf_input_path, AnalysisStatus.ERROR)
            analysis_info_out.set_message(wf_input_path, utility.get_error_message(error))
        except(Exception) as error:
            analysis_info_out.set_analysis_status(wf_input_path, AnalysisStatus.ERROR)
            analysis_info_out.set_message(wf_input_path, utility.get_error_message(error))

    analysis_info_out.analysis_end_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    return {'analysis_info_out': analysis_info_out}


# Test
if __name__ == '__main__':

    print('\n[vbm_test_processing test]')

    # Set the paths of the workflow input files.
    wf_input_path_list = [
        './test_project/T2_H477_SU007.nii',
        './test_project/Yagishita_Yagishita_20210929_H329_Chimerin_3_1_1.nii'
    ]

    # Create an AnalysisInfo object.
    project_path = r'../../test_data/cjs/test_project'
    analysis_info_in = AnalysisInfo(wf_input_path_list, project_path)

    # Run the node analysis.
    info = vbm_test_processing(analysis_info_in)

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
