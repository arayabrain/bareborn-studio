def test_params(client):
    response = client.get("/params/caiman_mc")
    data = response.json()

    assert response.status_code == 200
    assert isinstance(data, dict)

    border_nan = data["border_nan"]["value"]
    assert isinstance(border_nan, str)
    assert border_nan == "copy"

    use_cuda = data["use_cuda"]["value"]
    assert isinstance(use_cuda, bool)
    assert use_cuda is False


def test_snakemake_params(client):
    response = client.get("/snakemake")
    data = response.json()

    assert response.status_code == 200
    assert isinstance(data, dict)

    cores = data["cores"]["value"]
    assert isinstance(cores, int)
    assert cores == 2

    use_conda = data["use_conda"]["value"]
    assert isinstance(use_conda, bool)
    assert use_conda is True
