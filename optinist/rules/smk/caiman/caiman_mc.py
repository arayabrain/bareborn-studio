rule:
    input:
        config["rules"]["caiman_mc"]["input"]
    output:
        config["rules"]["caiman_mc"]["output"]
    # conda:
    #     "../../envs/caiman_env.yaml"
    script:
        "../../scripts/caiman/caiman_mc.py"