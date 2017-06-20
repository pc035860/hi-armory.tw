const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');

function fetchArmoryData(region, character) {
  const localeMap = {
    tw: 'zh-tw',
    eu: 'en-gb',
    us: 'en-us',
    kr: 'ko-kr'
  };

  const locale = localeMap[region] || localeMap.tw;
  const char = encodeURIComponent(character);
  const url = `https://worldofwarcraft.com/${locale}/search/character?q=${char}`;

  const extractBgImageUrl = (backgroundImage) => {
    const m = backgroundImage.match(/url\("?(.+?)"?\)/);
    if (!m) {
      return null;
    }
    return _.trim(m[1]);
  };

  const parseChar = ($elm) => {
    const art = extractBgImageUrl(
      $elm.find('.Character-bust .Art-image').css('background-image')
    );
    const avatar = extractBgImageUrl(
      $elm.find('.Character-avatar .Avatar-image').css('background-image')
    );
    const name = $elm.find('.Character-name').text();
    const level = Number($elm.find('.Character-level > b').text());
    const realm = $elm.find('.Character-realm').text();

    const tableCols = $elm.find('.SortTable-col');

    const race = tableCols.eq(2).text();
    const klass = tableCols.eq(3).text();
    const faction = tableCols.eq(4).text();

    return {
      pictures: {
        art,
        avatar
      },
      name,
      level,
      realm,
      race,
      class: klass,
      faction
    };
  };

  return axios.get(url).then((res) => {
    const $ = cheerio.load(res.data);

    return $('.SortTable-body a').map((i, elm) => parseChar($(elm))).toArray();
  });
}

export default fetchArmoryData;
