"""
sample of reading comments in a yaml file (using ruamel.yaml)
"""

# > pip install ruamel.yaml
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap

yaml = YAML()

yaml_file = "eta.yaml"
with open(yaml_file, "r") as file:
    data = yaml.load(file)

if isinstance(data, CommentedMap):
    # Get Top-level comments
    top_level_comment = data.ca.items.get(None)  # `None` indicates a top-level comment
    if top_level_comment:
        print("Top-level comment:", top_level_comment.value)

    # Get comments for each key
    for key in data:
        comment = data.ca.items.get(key)  # Get comments related to key
        if comment:
            pre_comment = comment[0]  # Comment before key
            inline_comment = comment[1]  # Comment in key line
            line_end_comment = comment[2]  # Comment in key line end
            print(f"Key '{key}' comments:")
            if pre_comment:
                print("  Pre-comment:", pre_comment.value)
            if inline_comment:
                print("  Inline-comment:", inline_comment.value)
            if line_end_comment:
                print("  Line-End-comment:", line_end_comment.value)
