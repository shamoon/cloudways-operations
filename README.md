# Cloudways API Action

Perform certain operations on a Cloudways server via the [Cloudways API]((https://developers.cloudways.com/)). Please note that not all API operations are permitted.

## Supported Operations
| Operation | Key | Parameters |
| --------- | --- | ---------- |
| [Change service state](https://developers.cloudways.com/docs/#!/ServiceApi#changeServiceState) | `service` | `service`: mysql, apache2, nginx, memcached, varnish, redis-server, php5-fpm, elasticsearch, supervisor <br/> `state`: start, stop, restart |
| [Update server varnish state](https://developers.cloudways.com/docs/#!/ServiceApi#updateServerVarnishState) | `varnish` | `action`: enable, disable, purge |
| [Purge Assets from Cloudways CDN](https://developers.cloudways.com/docs/#!/CloudwaysCDNApi#purgeassetsfromyourCloudwaysCDN) | `cdn_purge` | `app_id` |

## Required Inputs

##### 1. `email` **[required]**

Cloudways account email

##### 2. `api-key` **[required]**

Cloudways API key. See [https://platform.cloudways.com/api](https://platform.cloudways.com/api)

##### 3. `server-id` **[required]**

Numeric ID of the server, can be found in the URL of web panel e.g.: *platform.cloudways.com/server/**server-id**/access_detail*

##### 4. `operation` **[required]**

Operations are specified with a dot notation and should include each parameter. **Order matters**, use the same order as specified above. E.g. `service.mysql.restart` or `purge_cdn.12345` (where *12345* represents the `app_id`).

### Using Secrets

The safest way to pass credentials to this action is via Github Secrets. See https://docs.github.com/en/actions/security-guides/encrypted-secrets#using-encrypted-secrets-in-a-workflow

## Example Configuration
```yaml
name: Clear Server Varnish Cache

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
      - name: Build
        ...
      - name: Deploy
        ...
      - name: Purge Varnish
        uses: shamoon/cloudways-api-action@main
        with:
          email: ${{ secrets.CLOUDWAYS_EMAIL }}
          api-key: ${{ secrets.CLOUDWAYS_API_KEY }}
          server-id: ${{ secrets.CLOUDWAYS_SERVER_ID }}
          operation: varnish.purge
```

### Disclaimer

This can break things, be careful
